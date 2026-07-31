import type { Provider, RoutingPreference } from '../types/index.js'
import { providerRegistry } from './provider-registry.js'

export class DecisionEngine {
  selectProvider(preference: RoutingPreference): Provider | null {
    const providers = providerRegistry.getAllProviders()

    // Filter by constraints
    let candidates = providers.filter(p => {
      if (preference.maxPrice && p.pricePerRequest > preference.maxPrice) return false
      if (preference.minAvailability && p.availability < preference.minAvailability) return false
      if (preference.maxLatency && p.averageLatency > preference.maxLatency) return false
      return true
    })

    if (candidates.length === 0) return null

    // Route by preference
    switch (preference.prefer) {
      case 'cheapest':
        return this.selectCheapest(candidates)
      case 'fastest':
        return this.selectFastest(candidates)
      case 'reliable':
        return this.selectMostReliable(candidates)
      default:
        return candidates[0]
    }
  }

  private selectCheapest(providers: Provider[]): Provider {
    return providers.reduce((prev, curr) =>
      curr.pricePerRequest < prev.pricePerRequest ? curr : prev
    )
  }

  private selectFastest(providers: Provider[]): Provider {
    return providers.reduce((prev, curr) =>
      curr.averageLatency < prev.averageLatency ? curr : prev
    )
  }

  private selectMostReliable(providers: Provider[]): Provider {
    return providers.reduce((prev, curr) =>
      curr.availability > prev.availability ? curr : prev
    )
  }

  calculateScore(provider: Provider, weights: { price: number; latency: number; availability: number }): number {
    // Normalize and score
    const priceScore = 1 - (provider.pricePerRequest / 0.02) // 0.02 is max price
    const latencyScore = 1 - (provider.averageLatency / 300) // 300ms is max latency
    const availabilityScore = provider.availability

    return (
      priceScore * weights.price +
      latencyScore * weights.latency +
      availabilityScore * weights.availability
    )
  }
}

export const decisionEngine = new DecisionEngine()
