import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from './db.js'

export type TransactionRecord = {
  id: string
  createdAt: string
  status: 'success' | 'failed'
  providerId?: string
  providerName?: string
  preference?: string
  promptPreview?: string
  inboundPaymentReference?: string
  downstreamPaymentTx?: string
  providerCost?: number
  latencyMs?: number
  error?: string
  agentId?: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ledgerFile = path.join(__dirname, '../../transactions.json')
const maxRecords = 500

function readRecords(): TransactionRecord[] {
  try {
    const raw = fs.readFileSync(ledgerFile, 'utf8')
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value as TransactionRecord[] : []
  } catch {
    return []
  }
}

function writeRecords(records: TransactionRecord[]) {
  fs.writeFileSync(ledgerFile, JSON.stringify(records.slice(0, maxRecords), null, 2), 'utf8')
}

export const transactionLedger = {
  async list(limit = 50): Promise<TransactionRecord[]> {
    const safeLimit = Math.min(Math.max(limit, 1), maxRecords)
    if (!db) return readRecords().slice(0, safeLimit)

    const result = await db.query(`
      select id, created_at as "createdAt", status, provider_id as "providerId",
        provider_name as "providerName", preference, prompt_preview as "promptPreview",
        inbound_payment_reference as "inboundPaymentReference",
        downstream_payment_tx as "downstreamPaymentTx",
        provider_cost as "providerCost", latency_ms as "latencyMs", error, agent_id as "agentId"
      from routing_transactions
      order by created_at desc
      limit $1
    `, [safeLimit])
    return result.rows.map(row => ({
      ...row,
      providerCost: row.providerCost === null ? undefined : Number(row.providerCost),
      latencyMs: row.latencyMs === null ? undefined : Number(row.latencyMs),
    })) as TransactionRecord[]
  },
  async append(record: TransactionRecord) {
    if (db) {
      await db.query(`
        insert into routing_transactions (
          id, created_at, status, provider_id, provider_name, preference, prompt_preview,
          inbound_payment_reference, downstream_payment_tx, provider_cost, latency_ms, error, agent_id
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        record.id, record.createdAt, record.status, record.providerId ?? null,
        record.providerName ?? null, record.preference ?? null, record.promptPreview ?? null,
        record.inboundPaymentReference ?? null, record.downstreamPaymentTx ?? null,
        record.providerCost ?? null, record.latencyMs ?? null, record.error ?? null, record.agentId ?? null,
      ])
      return record
    }
    writeRecords([record, ...readRecords()])
    return record
  },
}
