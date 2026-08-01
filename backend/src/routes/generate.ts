import express, { Request, Response } from 'express'
import { paymentMiddleware } from '@x402-avm/express'
import { ALGORAND_MAINNET_CAIP2, ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm'
import { declareDiscoveryExtension } from '@x402-avm/extensions/bazaar'
import axios from 'axios'
import type { RoutesConfig } from '@x402-avm/core/http'
import { x402Client, x402HTTPClient } from '@x402-avm/core/client'
import { ExactAvmScheme as ExactAvmClientScheme } from '@x402-avm/avm/exact/client'
import { toClientAvmSigner } from '@x402-avm/avm'
import algosdk from 'algosdk'
import type { GenerateRequest, GenerateResponse } from '../types/index.js'
import { decisionEngine } from '../router/decision-engine.js'
import { providerRegistry } from '../router/provider-registry.js'
import { config } from '../config/index.js'
import { resourceServer } from '../payments/x402_client.js'
import { transactionLedger } from '../store/transaction-ledger.js'

const router = express.Router()
const activeNetwork: `${string}:${string}` = config.algorand.network === 'mainnet'
  ? ALGORAND_MAINNET_CAIP2
  : ALGORAND_TESTNET_CAIP2

const x402Routes: RoutesConfig = {
  'POST /generate': {
    accepts: {
      scheme: 'exact',
      network: activeNetwork,
      payTo: config.x402.payToAddress,
      price: `$${config.router.fee}`,
      extra: { asset: config.x402.usdcAssetId, tag: 'x402-global-challenge' },
    },
    description: 'Routes an AI prompt to the best paid provider and returns the result with settlement receipts.',
    mimeType: 'application/json',
    extensions: declareDiscoveryExtension({
      input: { prompt: 'Explain Algorand x402 simply.', prefer: 'cheapest' },
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', minLength: 1, maxLength: 12000 },
          prefer: { type: 'string', enum: ['cheapest', 'fastest', 'reliable'] },
          max_price: { type: 'string' },
          min_availability: { type: 'number', minimum: 0, maximum: 1 },
        },
        required: ['prompt'],
      },
      bodyType: 'json',
      output: {
        example: {
          success: true,
          result: 'Algorand x402 makes API payments part of the HTTP request lifecycle.',
          provider: 'Llama 3.2 (3B)',
          price_paid: '$0.005',
          latency_ms: 280,
          payment_tx: 'INBOUND_X402_TRANSACTION_ID',
          provider_payment_tx: 'DOWNSTREAM_X402_TRANSACTION_ID',
        },
      },
    }),
  },
}

type ProviderPaymentConfig = { endpoint: string; price: number; address: string; url: string }

const providers: Record<string, ProviderPaymentConfig> = {
  'cheap-llm': { endpoint: 'cheap', price: config.providers.cheap.price, address: config.providers.cheap.payToAddress, url: config.providers.cheap.url },
  'balanced-ai': { endpoint: 'balanced', price: config.providers.balanced.price, address: config.providers.balanced.payToAddress, url: config.providers.balanced.url },
  'premium-ai': { endpoint: 'premium', price: config.providers.premium.price, address: config.providers.premium.payToAddress, url: config.providers.premium.url },
}

function paymentReceiptFromHeader(header: string | undefined): string {
  if (!header) return 'settled-by-facilitator'
  try {
    const parsed = JSON.parse(Buffer.from(header, 'base64').toString('utf8')) as { txId?: string }
    return parsed.txId || 'settled-by-facilitator'
  } catch {
    return 'settled-by-facilitator'
  }
}

export type RouteInput = {
  prompt: string
  prefer: 'cheapest' | 'fastest' | 'reliable'
  maxPrice?: number
  minAvailability?: number
  inboundPaymentReference?: string
  agentId?: string
}

function validPrompt(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 12000
}

function createRouterPaymentClient(): x402HTTPClient {
  if (!config.router.privateKey) throw new Error('ROUTER_PRIVATE_KEY is required for downstream x402 settlement')
  let keyBase64 = config.router.privateKey
  if (config.router.privateKey.trim().split(/\s+/).length >= 20) {
    keyBase64 = Buffer.from(algosdk.mnemonicToSecretKey(config.router.privateKey).sk).toString('base64')
  }
  const signer = toClientAvmSigner(keyBase64)
  const client = new x402Client().register('algorand:*', new ExactAvmClientScheme(signer))
  return new x402HTTPClient(client)
}

async function callPaidProvider(url: string, prompt: string): Promise<{ result: string; transaction: string }> {
  const initial = await axios.post(url, { prompt }, { validateStatus: () => true, timeout: 30_000 })
  if (initial.status !== 402) {
    throw new Error(`Provider did not return an x402 challenge (HTTP ${initial.status})`)
  }
  const paymentClient = createRouterPaymentClient()
  const paymentRequired = paymentClient.getPaymentRequiredResponse(name => initial.headers[name.toLowerCase()], initial.data)
  const paymentPayload = await paymentClient.createPaymentPayload(paymentRequired)
  const settled = await axios.post<{ result?: string; error?: string; message?: string }>(url, { prompt }, {
    headers: { ...paymentClient.encodePaymentSignatureHeader(paymentPayload), 'Content-Type': 'application/json' },
    timeout: 30_000,
    validateStatus: () => true,
  })
  if (settled.status < 200 || settled.status >= 300) {
    const body = settled.data
    let detail = typeof body === 'object' && body
      ? body.message || body.error
      : undefined
    // A facilitator rejection is returned as another 402. Its reason is
    // encoded in PAYMENT-REQUIRED, not necessarily in the JSON body.
    if (!detail && settled.status === 402) {
      try {
        const challenge = paymentClient.getPaymentRequiredResponse(
          name => settled.headers[name.toLowerCase()],
          settled.data,
        ) as { error?: unknown; message?: unknown }
        detail = typeof challenge.error === 'string' ? challenge.error
          : typeof challenge.message === 'string' ? challenge.message
            : undefined
      } catch {
        // Keep the status-level diagnostic if the challenge itself is malformed.
      }
    }
    throw new Error(`Provider payment request failed (HTTP ${settled.status})${detail ? `: ${detail}` : ''}`)
  }
  const receipt = paymentClient.getPaymentSettleResponse(name => settled.headers[name.toLowerCase()])
  if (!receipt.success) throw new Error(receipt.errorMessage || receipt.errorReason || 'Provider payment did not settle')
  if (!settled.data.result) throw new Error('Provider returned no model result after payment settlement')
  return { result: settled.data.result, transaction: receipt.transaction }
}

export async function runRoute(input: RouteInput): Promise<GenerateResponse> {
  const provider = decisionEngine.selectProvider({
    prefer: input.prefer,
    maxPrice: input.maxPrice,
    minAvailability: input.minAvailability,
  })
  if (!provider) throw new Error('No provider matches the requested routing constraints')

  const downstream = providers[provider.id]
  if (!downstream) throw new Error(`Missing payment configuration for ${provider.id}`)
  if (!downstream.address) throw new Error('Selected provider is not configured for payment settlement')

  const startedAt = Date.now()
  const providerUrl = downstream.url || `${config.router.internalBaseUrl}/api/providers/${downstream.endpoint}/generate`
  const providerResponse = await callPaidProvider(providerUrl, input.prompt.trim())
  const latency = Date.now() - startedAt
  providerRegistry.updateStats(provider.id, latency, true)

  const response: GenerateResponse = {
    success: true,
    result: providerResponse.result,
    provider: provider.name,
    price_paid: `$${provider.pricePerRequest.toFixed(3)}`,
    latency_ms: latency,
    payment_tx: input.inboundPaymentReference || 'settled-by-facilitator',
    provider_payment_tx: providerResponse.transaction,
  }
  await transactionLedger.append({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'success',
    providerId: provider.id,
    providerName: provider.name,
    preference: input.prefer,
    inboundPaymentReference: response.payment_tx,
    downstreamPaymentTx: response.provider_payment_tx,
    providerCost: provider.pricePerRequest,
    latencyMs: latency,
    agentId: input.agentId,
  })
  return response
}

router.post('/generate', paymentMiddleware(x402Routes, resourceServer), async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<GenerateRequest>
    if (!validPrompt(body.prompt)) return res.status(400).json({ error: 'prompt must be a non-empty string up to 12,000 characters' })
    if (body.prefer && !['cheapest', 'fastest', 'reliable'].includes(body.prefer)) {
      return res.status(400).json({ error: 'prefer must be cheapest, fastest, or reliable' })
    }

    const maxPrice = body.max_price ? Number.parseFloat(body.max_price.replace('$', '')) : undefined
    const response = await runRoute({
      prompt: body.prompt.trim(),
      prefer: body.prefer || 'cheapest',
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      minAvailability: body.min_availability,
      inboundPaymentReference: paymentReceiptFromHeader(req.header('x-payment')),
    })
    return res.json(response)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Provider routing failed'
    console.error('Generate route failed:', message)
    return res.status(502).json({ error: 'Provider routing failed', message })
  }
})

export default router
