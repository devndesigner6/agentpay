import { x402ResourceServer } from '@x402-avm/express'
import { ExactAvmScheme } from '@x402-avm/avm/exact/server'
import { HTTPFacilitatorClient } from '@x402-avm/core/server'
import { ALGORAND_MAINNET_CAIP2, ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm'
import { bazaarResourceServerExtension } from '@x402-avm/extensions/bazaar'
import { config } from '../config/index.js'

const facilitatorUrl = config.x402.facilitatorUrl || 'https://facilitator.goplausible.xyz'

console.log(`📡 Connecting x402 Facilitator to: ${facilitatorUrl}`)

const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl,
})

export const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(ALGORAND_MAINNET_CAIP2, new ExactAvmScheme())
  .register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme())
  .registerExtension(bazaarResourceServerExtension)

let initialized = false

export async function initializeX402() {
  if (initialized) return
  try {
    await resourceServer.initialize()
    initialized = true
    console.log('✅ x402 Resource Server initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize x402 Resource Server:', error)
    // We can fallback or throw depending on design, but let's log it
  }
}
