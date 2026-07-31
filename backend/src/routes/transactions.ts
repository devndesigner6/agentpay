import express, { Request, Response } from 'express'
import { transactionLedger } from '../store/transaction-ledger.js'

const router = express.Router()

router.get('/transactions', (req: Request, res: Response) => {
  const requestedLimit = Number.parseInt(String(req.query.limit || '50'), 10)
  res.json({ transactions: transactionLedger.list(Number.isFinite(requestedLimit) ? requestedLimit : 50) })
})

export default router
