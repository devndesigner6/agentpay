import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
  list(limit = 50) {
    return readRecords().slice(0, Math.min(Math.max(limit, 1), maxRecords))
  },
  append(record: TransactionRecord) {
    writeRecords([record, ...readRecords()])
    return record
  },
}
