export interface Provider {
  id: string
  name: string
  description: string
  pricePerRequest: number
  averageLatency: number
  availability: number
  capabilities: string[]
  endpoint: string
}

export interface RoutingPreference {
  prefer: 'cheapest' | 'fastest' | 'reliable'
  maxPrice?: number
  minAvailability?: number
  maxLatency?: number
}

export interface GenerateRequest {
  prompt: string
  prefer: 'cheapest' | 'fastest' | 'reliable'
  max_price?: string
  min_availability?: number
}

export interface GenerateResponse {
  success: boolean
  result?: string
  provider: string
  price_paid: string
  latency_ms: number
  payment_tx: string
  provider_payment_tx: string
  error?: string
}

export interface ProviderStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalLatency: number
  averageLatency: number
  availability: number
  lastUpdated: Date
}

export interface PaymentProof {
  txn: string
  signature: string
}
