import { x402Client, x402HTTPClient } from '@x402-avm/core/client'
import { ExactAvmScheme } from '@x402-avm/avm/exact/client'
import type { PeraWalletConnect } from '@perawallet/connect'
import algosdk from 'algosdk'

type PaymentRequiredResponse = Record<string, unknown> & { accepts?: unknown[] }

/**
 * x402 v2 resource servers return their challenge in PAYMENT-REQUIRED.  The
 * response body may intentionally be empty, so parse the header before using
 * the challenge to construct a Pera signing payload.
 */
export function readPaymentRequiredResponse(payload: unknown, paymentRequiredHeader?: string): PaymentRequiredResponse {
  if (!paymentRequiredHeader) return normalizePaymentRequired(payload)

  const client = new x402HTTPClient(new x402Client())
  return client.getPaymentRequiredResponse(
    (name) => name.toLowerCase() === 'payment-required' ? paymentRequiredHeader : null,
    payload,
  ) as PaymentRequiredResponse
}

export function normalizePaymentRequired(payload: unknown): PaymentRequiredResponse {
  const root = (payload && typeof payload === 'object' ? payload : {}) as PaymentRequiredResponse
  const paymentRequired = (root.payment_required && typeof root.payment_required === 'object'
    ? root.payment_required
    : root) as PaymentRequiredResponse
  const accepted = Array.isArray(paymentRequired.accepts) ? paymentRequired.accepts[0] : undefined
  const normalized = { ...paymentRequired, ...(accepted && typeof accepted === 'object' ? accepted : {}) } as PaymentRequiredResponse
  if (typeof normalized.amount === 'string' && typeof normalized.price !== 'string') {
    const microUsd = Number(normalized.amount)
    if (Number.isFinite(microUsd)) normalized.price = `$${(microUsd / 1_000_000).toFixed(3)}`
  }
  return normalized
}

export async function createPeraPaymentHeaders(
  paymentRequired: PaymentRequiredResponse,
  address: string,
  peraWallet: PeraWalletConnect,
): Promise<Record<string, string>> {
  const signer = {
    address,
    signTransactions: async (transactions: Uint8Array[], indexesToSign?: number[]) => {
      const indexes = indexesToSign || transactions.map((_, index) => index)
      const group = transactions.map((txn, index) => ({
        txn: algosdk.decodeUnsignedTransaction(txn),
        signers: indexes.includes(index) ? [address] : [],
      }))
      const signed = await peraWallet.signTransaction([group])
      // Pera filters out transactions it was instructed not to sign. x402's
      // facilitator fee-payer transaction is intentionally unsigned, so map
      // the compact Pera response back onto the original transaction indexes.
      let signedCursor = 0
      return transactions.map((_, index) => {
        if (!indexes.includes(index)) return null
        const signedTransaction = signed[signedCursor++]
        if (!signedTransaction) throw new Error(`Pera did not return a signature for x402 transaction index ${index}`)
        return signedTransaction
      })
    },
  }
  const client = new x402HTTPClient(new x402Client().register('algorand:*', new ExactAvmScheme(signer)))
  // paymentRequired is already decoded from the PAYMENT-REQUIRED response
  // header. Re-parsing it without that header makes the x402 SDK reject it.
  const paymentPayload = await client.createPaymentPayload(
    paymentRequired as Parameters<typeof client.createPaymentPayload>[0],
  )
  return client.encodePaymentSignatureHeader(paymentPayload)
}
