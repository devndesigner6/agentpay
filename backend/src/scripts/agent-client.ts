import 'dotenv/config'
import algosdk from 'algosdk'
import { x402Client, x402HTTPClient } from '@x402-avm/core/client'
import { ExactAvmScheme } from '@x402-avm/avm/exact/client'
import { toClientAvmSigner } from '@x402-avm/avm'

const url = process.env.AGENTPAY_URL || 'http://127.0.0.1:3000/api/generate'
const mnemonic = process.env.AGENT_MNEMONIC

if (!mnemonic) {
  throw new Error('Set AGENT_MNEMONIC to a funded Testnet/Mainnet Algorand wallet mnemonic before running this example.')
}

const secret = algosdk.mnemonicToSecretKey(mnemonic)
const signer = toClientAvmSigner(Buffer.from(secret.sk).toString('base64'))
const paymentClient = new x402HTTPClient(
  new x402Client().register('algorand:*', new ExactAvmScheme(signer)),
)

const request = {
  prompt: process.env.AGENT_PROMPT || 'Explain why x402 is useful for autonomous AI agents.',
  prefer: process.env.AGENT_PREFERENCE || 'cheapest',
}

async function run() {
  const unpaid = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (unpaid.status !== 402) {
    throw new Error(`Expected HTTP 402, received ${unpaid.status}: ${await unpaid.text()}`)
  }

  const challenge = paymentClient.getPaymentRequiredResponse(
    name => unpaid.headers.get(name),
    await unpaid.json(),
  )
  const paymentPayload = await paymentClient.createPaymentPayload(challenge)
  const paid = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...paymentClient.encodePaymentSignatureHeader(paymentPayload),
    },
    body: JSON.stringify(request),
  })
  if (!paid.ok) throw new Error(`Paid request failed (${paid.status}): ${await paid.text()}`)

  const settlement = paymentClient.getPaymentSettleResponse(name => paid.headers.get(name))
  const result = await paid.json() as Record<string, unknown>
  console.log(JSON.stringify({
    agentAddress: secret.addr,
    inboundSettlementTx: settlement.transaction,
    provider: result.provider,
    downstreamSettlementTx: result.provider_payment_tx,
    result: result.result,
  }, null, 2))
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
