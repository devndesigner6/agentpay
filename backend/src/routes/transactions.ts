import express, { Request, Response } from 'express'
import { transactionLedger } from '../store/transaction-ledger.js'

const router = express.Router()

router.get('/transactions', async (req: Request, res: Response) => {
  const requestedLimit = Number.parseInt(String(req.query.limit || '50'), 10)
  try {
    const transactions = await transactionLedger.list(Number.isFinite(requestedLimit) ? requestedLimit : 50)
    res.json({ transactions })
  } catch (error) {
    console.error('Could not load transaction history:', error)
    res.status(503).json({ error: 'Transaction history is temporarily unavailable' })
  }
})

export default router
