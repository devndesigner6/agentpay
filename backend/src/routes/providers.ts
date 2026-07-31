import express, { Request, Response } from 'express'
import { paymentMiddleware } from '@x402-avm/express'
import { ALGORAND_MAINNET_CAIP2, ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm'
import { declareDiscoveryExtension } from '@x402-avm/extensions/bazaar'
import { resourceServer } from '../payments/x402_client.js'
import { config } from '../config/index.js'
import { generateResponse } from '../providers/mock-ai.js'
import { providerRegistry } from '../router/provider-registry.js'
import type { RoutesConfig } from '@x402-avm/core/http'

const router = express.Router()
const activeNetwork: `${string}:${string}` = config.algorand.network === 'mainnet'
  ? ALGORAND_MAINNET_CAIP2
  : ALGORAND_TESTNET_CAIP2

const discovery = (provider: string) => declareDiscoveryExtension({
  input: { prompt: 'Summarize why a payment router is useful.' },
  inputSchema: {
    type: 'object',
    properties: { prompt: { type: 'string', minLength: 1 } },
    required: ['prompt'],
  },
  bodyType: 'json',
  output: { example: { result: `${provider} generated response` } },
})

const protectedProviderRoute = (path: string, price: number, payTo: string, description: string, provider: string): RoutesConfig => ({
  [`POST ${path}`]: {
    accepts: {
      scheme: 'exact',
      network: activeNetwork,
      payTo,
      price: `$${price}`,
      extra: { asset: config.x402.usdcAssetId, tag: 'x402-global-challenge' },
    },
    description,
    mimeType: 'application/json',
    extensions: discovery(provider),
  },
})

router.get('/providers', (_req: Request, res: Response) => {
  res.json({ providers: providerRegistry.getAllProviders() })
})

router.post(
  '/providers/cheap/generate',
  paymentMiddleware(protectedProviderRoute(
    '/providers/cheap/generate', config.providers.cheap.price, config.providers.cheap.payToAddress,
    'Low-cost AI text generation for straightforward prompts.', 'Budget AI',
  ), resourceServer),
  async (req: Request, res: Response) => {
    try {
      res.json({ result: await generateResponse(req.body.prompt, 'cheap-llm') })
    } catch (error: unknown) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Provider failed' })
    }
  },
)

router.post(
  '/providers/balanced/generate',
  paymentMiddleware(protectedProviderRoute(
    '/providers/balanced/generate', config.providers.balanced.price, config.providers.balanced.payToAddress,
    'Balanced AI text generation for general-purpose agent tasks.', 'Balanced AI',
  ), resourceServer),
  async (req: Request, res: Response) => {
    try {
      res.json({ result: await generateResponse(req.body.prompt, 'balanced-ai') })
    } catch (error: unknown) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Provider failed' })
    }
  },
)

router.post(
  '/providers/premium/generate',
  paymentMiddleware(protectedProviderRoute(
    '/providers/premium/generate', config.providers.premium.price, config.providers.premium.payToAddress,
    'Fast premium AI generation for complex reasoning tasks.', 'Premium AI',
  ), resourceServer),
  async (req: Request, res: Response) => {
    try {
      res.json({ result: await generateResponse(req.body.prompt, 'premium-ai') })
    } catch (error: unknown) {
      res.status(502).json({ error: error instanceof Error ? error.message : 'Provider failed' })
    }
  },
)

export default router
