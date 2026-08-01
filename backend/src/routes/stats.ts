import express, { Request, Response } from 'express'
import { providerRegistry } from '../router/provider-registry.js'
import { db } from '../store/db.js'

const router = express.Router()

router.get('/stats', async (_req: Request, res: Response) => {
  const providers = providerRegistry.getAllProviders()
  try {
    const aggregate = db ? await db.query(`
      select provider_id as id,
        count(*) as requests,
        count(*) filter (where status = 'success') as successful_requests,
        coalesce(sum(provider_cost) filter (where status = 'success'), 0) as volume,
        avg(latency_ms) filter (where status = 'success') as avg_latency
      from routing_transactions group by provider_id
    `) : undefined
    const byId = new Map((aggregate?.rows || []).map(row => [row.id, row]))
    const providerStats = providers.map(provider => {
      const row = byId.get(provider.id)
      const requests = Number(row?.requests || 0)
      const successful = Number(row?.successful_requests || 0)
      return {
        id: provider.id,
        name: provider.name,
        requests,
        avg_latency: Math.round(Number(row?.avg_latency || provider.averageLatency)),
        availability: requests ? Number((successful / requests).toFixed(3)) : provider.availability,
        total_revenue: `$${Number(row?.volume || 0).toFixed(3)}`,
      }
    })
    const totalRequests = providerStats.reduce((sum, provider) => sum + provider.requests, 0)
    const totalVolume = providerStats.reduce((sum, provider) => sum + Number(provider.total_revenue.slice(1)), 0)
    const routingDistribution: Record<string, number> = {}
    if (totalRequests) providerStats.forEach(provider => {
      if (provider.requests) routingDistribution[provider.id] = Math.round((provider.requests / totalRequests) * 100)
    })
    res.json({ total_requests: totalRequests, total_usdc_volume: totalVolume.toFixed(3), routing_distribution: routingDistribution, provider_stats: providerStats, telemetry_source: db ? 'neon-postgres' : 'in-memory-fallback' })
  } catch (error) {
    console.error('Could not load routing stats:', error)
    res.status(503).json({ error: 'Routing telemetry is temporarily unavailable' })
  }
})

export default router
