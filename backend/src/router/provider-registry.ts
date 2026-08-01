import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Provider, ProviderStats } from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.join(__dirname, '../../database.json')

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map()
  private stats: Map<string, ProviderStats> = new Map()

  constructor() {
    this.loadFromDisk()
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8')
        if (fileContent.trim().length > 0) {
          const data = JSON.parse(fileContent)
          if (data.providers && data.stats) {
            this.providers = new Map(Object.entries(data.providers))
            const parsedStats = Object.entries(data.stats).map(([k, v]: [string, any]) => {
              return [k, { ...v, lastUpdated: new Date(v.lastUpdated) }]
            })
            this.stats = new Map(parsedStats as any)
            return
          }
        }
      }
    } catch (e) {
      console.error('Failed to load database from disk, using defaults:', e)
    }
    this.initializeProviders()
    this.saveToDisk()
  }

  private saveToDisk() {
    try {
      const data = {
        providers: Object.fromEntries(this.providers.entries()),
        stats: Object.fromEntries(this.stats.entries())
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
    } catch (e) {
      console.error('Failed to write database to disk:', e)
    }
  }

  private initializeProviders() {
    const providers: Provider[] = [
      {
        id: 'cheap-llm',
        name: 'Laguna XS 2.1 (free)',
        description: 'Low-cost OpenRouter text model for fast everyday prompts.',
        pricePerRequest: 0.005,
        averageLatency: 280,
        availability: 0.98,
        capabilities: ['text', 'summarization'],
        endpoint: '/providers/cheap',
      },
      {
        id: 'premium-ai',
        name: 'Nemotron 3 Ultra (free)',
        description: 'High-capability OpenRouter reasoning route for complex requests.',
        pricePerRequest: 0.02,
        averageLatency: 180,
        availability: 0.99,
        capabilities: ['text', 'code', 'reasoning', 'analysis'],
        endpoint: '/providers/premium',
      },
      {
        id: 'balanced-ai',
        name: 'Gemma 4 31B (free)',
        description: 'Balanced OpenRouter text model for analysis and coding tasks.',
        pricePerRequest: 0.01,
        averageLatency: 220,
        availability: 0.97,
        capabilities: ['text', 'analysis', 'creative', 'code'],
        endpoint: '/providers/balanced',
      },
    ]

    providers.forEach(provider => {
      this.providers.set(provider.id, provider)
      this.stats.set(provider.id, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalLatency: 0,
        averageLatency: provider.averageLatency,
        availability: provider.availability,
        lastUpdated: new Date(),
      })
    })
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id)
  }

  getAllProviders(): Provider[] {
    return Array.from(this.providers.values())
  }

  getStats(id: string): ProviderStats | undefined {
    return this.stats.get(id)
  }

  updateStats(id: string, latency: number, success: boolean) {
    const stats = this.stats.get(id)
    if (!stats) return

    stats.totalRequests++
    if (success) {
      stats.successfulRequests++
      stats.totalLatency += latency
      stats.averageLatency = stats.totalLatency / stats.successfulRequests
    } else {
      stats.failedRequests++
    }

    stats.availability = stats.successfulRequests / stats.totalRequests
    stats.lastUpdated = new Date()

    // Update provider averageLatency
    const provider = this.providers.get(id)
    if (provider) {
      provider.averageLatency = stats.averageLatency
      provider.availability = stats.availability
    }

    this.saveToDisk()
  }
}

export const providerRegistry = new ProviderRegistry()
