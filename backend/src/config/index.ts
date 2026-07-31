import dotenv from 'dotenv'

dotenv.config()

const network = process.env.ALGORAND_NETWORK || 'testnet'
const defaultUsdcAssetId = network === 'mainnet' ? '31566704' : '10458941'
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(value => value.trim()).filter(Boolean)
const isAlgorandAddress = (value: string) => /^[A-Z2-7]{58}$/.test(value)
const hasUsableRouterKey = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  // Algorand mnemonics have 25 words. Base64 secret keys are also supported
  // for non-browser deployments.
  return words.length === 25 || /^[A-Za-z0-9+/]{86}==$/.test(value.trim())
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  web: {
    allowedOrigins,
  },

  algorand: {
    network,
    algodUrl: process.env.ALGORAND_ALGOD_URL || (network === 'mainnet'
      ? 'https://mainnet-api.algonode.cloud'
      : 'https://testnet-api.algonode.cloud'),
    algodToken: process.env.ALGORAND_ALGOD_TOKEN || '',
    indexerUrl: process.env.ALGORAND_INDEXER_URL || (network === 'mainnet'
      ? 'https://mainnet-idx.algonode.cloud'
      : 'https://testnet-idx.algonode.cloud'),
  },

  x402: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://facilitator.goplausible.xyz',
    payToAddress: process.env.X402_PAY_TO_ADDRESS || '',
    usdcAssetId: parseInt(process.env.USDC_ASSET_ID || defaultUsdcAssetId, 10),
    hasValidPayToAddress: isAlgorandAddress(process.env.X402_PAY_TO_ADDRESS || ''),
  },

  router: {
    fee: parseFloat(process.env.ROUTER_FEE || '0.03'),
    privateKey: process.env.ROUTER_PRIVATE_KEY || '',
    hasUsablePrivateKey: hasUsableRouterKey(process.env.ROUTER_PRIVATE_KEY || ''),
    internalBaseUrl: process.env.INTERNAL_BASE_URL || `http://127.0.0.1:${process.env.PORT || '3000'}`,
  },

  providers: {
    cheap: {
      price: parseFloat(process.env.CHEAP_PROVIDER_PRICE || '0.005'),
      payToAddress: process.env.CHEAP_PAY_TO_ADDRESS || '',
      url: process.env.CHEAP_PROVIDER_URL || '',
    },
    premium: {
      price: parseFloat(process.env.PREMIUM_PROVIDER_PRICE || '0.02'),
      payToAddress: process.env.PREMIUM_PAY_TO_ADDRESS || '',
      url: process.env.PREMIUM_PROVIDER_URL || '',
    },
    balanced: {
      price: parseFloat(process.env.BALANCED_PROVIDER_PRICE || '0.01'),
      payToAddress: process.env.BALANCED_PAY_TO_ADDRESS || '',
      url: process.env.BALANCED_PROVIDER_URL || '',
    },
  },
  modelProvider: {
    openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
  },
}
