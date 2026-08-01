import express from 'express'
import crypto from 'crypto'
import { db } from '../store/db.js'
import { transactionLedger } from '../store/transaction-ledger.js'

const router = express.Router()
const hash = (key: string) => crypto.createHash('sha256').update(key).digest('hex')
const validPreference = (value: unknown): value is 'cheapest' | 'fastest' | 'reliable' => typeof value === 'string' && ['cheapest', 'fastest', 'reliable'].includes(value)

router.get('/agents', async (_req, res) => {
  if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' })
  const result = await db.query('select id,name,description,preference,max_price,daily_budget,created_at from agents order by created_at desc')
  res.json({ agents: result.rows })
})

router.post('/agents', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' })
  const { name, description = '', preference = 'cheapest', max_price = .03, daily_budget = 5 } = req.body
  const maxPrice = Number(max_price)
  const dailyBudget = Number(daily_budget)
  if (typeof name !== 'string' || !name.trim() || !validPreference(preference) || !Number.isFinite(maxPrice) || maxPrice <= 0 || !Number.isFinite(dailyBudget) || dailyBudget <= 0) {
    return res.status(400).json({ error: 'A name, valid preference, positive max_price, and positive daily_budget are required' })
  }
  const id = crypto.randomUUID()
  await db.query('insert into agents(id,name,description,preference,max_price,daily_budget) values($1,$2,$3,$4,$5,$6)', [id, name.trim(), description, preference, maxPrice, dailyBudget])
  const secret = `ap_live_${crypto.randomBytes(24).toString('hex')}`
  await db.query('insert into api_keys(id,agent_id,key_hash,key_prefix) values($1,$2,$3,$4)', [crypto.randomUUID(), id, hash(secret), secret.slice(0, 12)])
  res.status(201).json({ agent: { id, name: name.trim(), description, preference, max_price: maxPrice, daily_budget: dailyBudget }, api_key: secret })
})

router.patch('/agents/:id', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' })
  const { preference, max_price, daily_budget } = req.body
  if (!validPreference(preference) || !Number.isFinite(Number(max_price)) || Number(max_price) <= 0 || !Number.isFinite(Number(daily_budget)) || Number(daily_budget) <= 0) {
    return res.status(400).json({ error: 'Provide a valid preference, positive max_price, and positive daily_budget' })
  }
  const result = await db.query('update agents set preference=$1,max_price=$2,daily_budget=$3 where id=$4 returning id,name,preference,max_price,daily_budget', [preference, Number(max_price), Number(daily_budget), req.params.id])
  if (!result.rowCount) return res.status(404).json({ error: 'Agent not found' })
  res.json({ agent: result.rows[0] })
})

router.get('/agents/:id/keys', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' })
  const result = await db.query('select id,key_prefix,created_at,revoked_at from api_keys where agent_id=$1 order by created_at desc', [req.params.id])
  res.json({ keys: result.rows })
})

router.delete('/agents/:agentId/keys/:keyId', async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' })
  const result = await db.query('update api_keys set revoked_at=now() where id=$1 and agent_id=$2 and revoked_at is null returning id,key_prefix,revoked_at', [req.params.keyId, req.params.agentId])
  if (!result.rowCount) return res.status(404).json({ error: 'Active API key not found' })
  res.json({ key: result.rows[0] })
})

router.get('/agents/:id/runs', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100)
  res.json({ runs: await transactionLedger.listForAgent(req.params.id, limit) })
})

export default router
