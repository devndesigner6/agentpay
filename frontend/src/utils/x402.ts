import { x402Client, x402HTTPClient } from '@x402-avm/core/client'
import { ExactAvmScheme } from '@x402-avm/avm/exact/client'
import type { PeraWalletConnect } from '@perawallet/connect'
import algosdk from 'algosdk'

type PaymentRequiredResponse = Record<string, unknown> & { accepts?: unknown[] }

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
      return transactions.map((_, index) => indexes.includes(index) ? signed[index] : null)
    },
  }
  const client = new x402HTTPClient(new x402Client().register('algorand:*', new ExactAvmScheme(signer)))
  const challenge = client.getPaymentRequiredResponse(() => null, paymentRequired)
  return client.encodePaymentSignatureHeader(await client.createPaymentPayload(challenge))
}
