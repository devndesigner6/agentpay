import express from 'express'
import crypto from 'crypto'
import { db } from '../store/db.js'

const router = express.Router()
const hash = (key: string) => crypto.createHash('sha256').update(key).digest('hex')
router.get('/agents', async (_req, res) => { if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' }); const r = await db.query('select id,name,description,preference,max_price,created_at from agents order by created_at desc'); res.json({ agents: r.rows }) })
router.post('/agents', async (req, res) => { if (!db) return res.status(503).json({ error: 'DATABASE_URL is not configured' }); const { name, description='', preference='cheapest', max_price=.03 } = req.body; if (!name || !['cheapest','fastest','reliable'].includes(preference)) return res.status(400).json({ error: 'Valid name and preference required' }); const id=crypto.randomUUID(); await db.query('insert into agents(id,name,description,preference,max_price) values($1,$2,$3,$4,$5)',[id,name,description,preference,max_price]); const secret=`ap_live_${crypto.randomBytes(24).toString('hex')}`; await db.query('insert into api_keys(id,agent_id,key_hash,key_prefix) values($1,$2,$3,$4)',[crypto.randomUUID(),id,hash(secret),secret.slice(0,12)]); res.status(201).json({ agent:{id,name,description,preference,max_price}, api_key:secret }) })
router.get('/agents/:id/keys', async (req,res)=>{ if(!db)return res.status(503).json({error:'DATABASE_URL is not configured'}); const r=await db.query('select id,key_prefix,created_at,revoked_at from api_keys where agent_id=$1 order by created_at desc',[req.params.id]); res.json({keys:r.rows}) })
export default router
