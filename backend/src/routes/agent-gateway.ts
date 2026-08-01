import crypto from 'crypto'
import express, { Request, Response, NextFunction } from 'express'
import { paymentMiddleware } from '@x402-avm/express'
import type { RoutesConfig } from '@x402-avm/core/http'
import { ALGORAND_MAINNET_CAIP2, ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm'
import { db } from '../store/db.js'
import { config } from '../config/index.js'
import { providerRegistry } from '../router/provider-registry.js'
import { runRoute } from './generate.js'
import { resourceServer } from '../payments/x402_client.js'
import { transactionLedger } from '../store/transaction-ledger.js'

type AgentIdentity = { id: string; name: string; preference: 'cheapest' | 'fastest' | 'reliable'; maxPrice: number; dailyBudget: number }
declare global { namespace Express { interface Request { agent?: AgentIdentity } } }

const router = express.Router()
const activeNetwork: `${string}:${string}` = config.algorand.network === 'mainnet' ? ALGORAND_MAINNET_CAIP2 : ALGORAND_TESTNET_CAIP2
const agentRoutes: RoutesConfig = {
  'POST /chat/completions': {
    accepts: { scheme: 'exact', network: activeNetwork, payTo: config.x402.payToAddress, price: `$${config.router.fee}`, extra: { asset: config.x402.usdcAssetId, tag: 'agentpay-agent-gateway' } },
    description: 'AgentPay OpenAI-compatible paid AI routing endpoint.', mimeType: 'application/json',
  },
}
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

function readApiKey(req: Request) {
  const authorization = req.header('authorization')
  if (authorization?.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim()
  return req.header('x-agentpay-key')?.trim()
}

async function authenticateAgent(req: Request, res: Response, next: NextFunction) {
  if (!db) return res.status(503).json({ error: 'Agent gateway is unavailable: DATABASE_URL is not configured' })
  const key = readApiKey(req)
  if (!key || !key.startsWith('ap_live_')) return res.status(401).json({ error: 'Provide an AgentPay API key using Authorization: Bearer ap_live_...' })
  try {
    const result = await db.query(`select a.id, a.name, a.preference, a.max_price as "maxPrice", a.daily_budget as "dailyBudget" from api_keys k join agents a on a.id = k.agent_id where k.key_hash = $1 and k.revoked_at is null limit 1`, [hash(key)])
    if (!result.rowCount) return res.status(401).json({ error: 'Invalid or revoked AgentPay API key' })
    const agent = result.rows[0]
    req.agent = { ...agent, maxPrice: Number(agent.maxPrice), dailyBudget: Number(agent.dailyBudget) }
    next()
  } catch (error) {
    console.error('Agent authentication failed:', error)
    res.status(503).json({ error: 'Agent gateway is temporarily unavailable' })
  }
}

async function enforceAgentBudget(req: Request, res: Response, next: NextFunction) {
  if (!req.agent) return res.status(401).json({ error: 'Agent authentication required' })
  try {
    const spent = await transactionLedger.spendLast24Hours(req.agent.id)
    if (spent + config.router.fee > req.agent.dailyBudget) {
      return res.status(429).json({
        error: 'Daily agent budget exceeded',
        budget: req.agent.dailyBudget,
        spent: Number(spent.toFixed(3)),
        next_request_cost: config.router.fee,
      })
    }
    next()
  } catch (error) {
    console.error('Agent budget check failed:', error)
    res.status(503).json({ error: 'Could not validate agent budget' })
  }
}

function messagesToPrompt(messages: unknown): string | undefined {
  if (!Array.isArray(messages) || messages.length === 0) return undefined
  const text = messages.map((message: { role?: unknown; content?: unknown }) => {
    if (typeof message?.content !== 'string' || !message.content.trim()) return ''
    const role = typeof message.role === 'string' ? message.role : 'user'
    return `${role}: ${message.content.trim()}`
  }).filter(Boolean).join('\n')
  return text.length > 0 && text.length <= 12_000 ? text : undefined
}

router.get('/models', authenticateAgent, (_req, res) => {
  const now = Math.floor(Date.now() / 1000)
  res.json({ object: 'list', data: providerRegistry.getAllProviders().map(provider => ({
    id: `agentpay/${provider.id}`, object: 'model', created: now, owned_by: 'agentpay',
    metadata: { display_name: provider.name, price_per_request: provider.pricePerRequest, availability: provider.availability, capabilities: provider.capabilities },
  })) })
})

router.post('/chat/completions', authenticateAgent, enforceAgentBudget, paymentMiddleware(agentRoutes, resourceServer), async (req: Request, res: Response) => {
  if (req.body?.stream === true) return res.status(400).json({ error: 'Streaming is not implemented yet; set stream to false.' })
  const prompt = messagesToPrompt(req.body?.messages)
  if (!prompt) return res.status(400).json({ error: 'messages must contain non-empty text content up to 12,000 characters' })
  if (!req.agent) return res.status(401).json({ error: 'Agent authentication required' })
  try {
    const routed = await runRoute({ prompt, prefer: req.agent.preference, maxPrice: req.agent.maxPrice, agentId: req.agent.id, dailyBudget: req.agent.dailyBudget, inboundPaymentReference: 'settled-by-facilitator' })
    res.json({
      id: `chatcmpl_${crypto.randomUUID().replace(/-/g, '')}`, object: 'chat.completion', created: Math.floor(Date.now() / 1000), model: `agentpay/${routed.provider}`,
      choices: [{ index: 0, message: { role: 'assistant', content: routed.result }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      agentpay: { agent_id: req.agent.id, agent_name: req.agent.name, routing_policy: req.agent.preference, daily_budget: `$${req.agent.dailyBudget.toFixed(2)}`, route: routed.provider, router_fee: `$${config.router.fee.toFixed(3)}`, provider_cost: routed.price_paid, provider_payment_tx: routed.provider_payment_tx },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Agent routing failed'
    console.error('Agent gateway route failed:', message)
    res.status(message.startsWith('No provider') ? 503 : 502).json({ error: 'Agent routing failed', message })
  }
})

export default router
