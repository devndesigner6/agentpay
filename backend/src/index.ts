import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import generateRoutes from './routes/generate.js'
import statsRoutes from './routes/stats.js'
import providersRoutes from './routes/providers.js'
import transactionsRoutes from './routes/transactions.js'
import { initializeX402 } from './payments/x402_client.js'

const app = express()

// Middleware
app.use(cors({
  origin: config.web.allowedOrigins.length ? config.web.allowedOrigins : true,
  // Browsers must be allowed to read the x402 challenge and settlement headers.
  exposedHeaders: ['PAYMENT-REQUIRED', 'PAYMENT-RESPONSE', 'X-PAYMENT-RESPONSE'],
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: config.algorand.network,
    x402: {
      facilitator: config.x402.facilitatorUrl,
      receivingWalletConfigured: config.x402.hasValidPayToAddress,
      routerWalletConfigured: config.router.hasUsablePrivateKey,
      providerWalletsConfigured: Object.values(config.providers).every(provider => /^[A-Z2-7]{58}$/.test(provider.payToAddress)),
      realModelProviderConfigured: config.modelProvider.openRouterConfigured,
    },
  })
})

// Routes
app.use('/api', generateRoutes)
app.use('/api', statsRoutes)
app.use('/api', providersRoutes)
app.use('/api', transactionsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
initializeX402().then(() => {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 AgentPay Backend running on port ${config.port}`)
    console.log(`📍 Network: ${config.algorand.network}`)
    console.log(`💰 Router fee: $${config.router.fee}`)
    console.log(`\n📡 Endpoints:`)
    console.log(`   POST /api/generate - Main routing endpoint`)
    console.log(`   GET  /api/providers - List providers`)
    console.log(`   GET  /api/stats - Routing statistics`)
    console.log(`   GET  /api/transactions - Settled routing history`)
  })
})
