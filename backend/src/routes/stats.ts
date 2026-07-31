import express, { Request, Response } from 'express'
import { providerRegistry } from '../router/provider-registry.js'

const router = express.Router()

// GET /stats - Global routing statistics
router.get('/stats', (req: Request, res: Response) => {
  const providers = providerRegistry.getAllProviders()

  let totalRequests = 0
  let totalVolume = 0
  const providerStats = providers.map(provider => {
    const stats = providerRegistry.getStats(provider.id)
    if (stats) {
      totalRequests += stats.totalRequests
      totalVolume += stats.totalRequests * provider.pricePerRequest
    }

    return {
      id: provider.id,
      name: provider.name,
      requests: stats?.totalRequests || 0,
      avg_latency: Math.round(stats?.averageLatency || provider.averageLatency),
      availability: stats?.availability || provider.availability,
      total_revenue: `$${((stats?.totalRequests || 0) * provider.pricePerRequest).toFixed(3)}`,
    }
  })

  // Calculate routing distribution
  const totalProviderRequests = providerStats.reduce((sum, p) => sum + p.requests, 0)
  const routingDistribution: Record<string, number> = {}

  if (totalProviderRequests > 0) {
    providerStats.forEach(p => {
      const percentage = Math.round((p.requests / totalProviderRequests) * 100)
      if (percentage > 0) {
        routingDistribution[p.name.toLowerCase().replace(' ', '-')] = percentage
      }
    })
  }

  res.json({
    total_requests: totalRequests,
    total_usdc_volume: totalVolume.toFixed(2),
    routing_distribution: routingDistribution,
    provider_stats: providerStats,
  })
})

export default router
