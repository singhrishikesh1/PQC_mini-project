import { Router, type Request, type Response } from 'express'
import { getAnalytics } from '../db'

export const analyticsRouter = Router()

// GET /api/analytics
analyticsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const stats = await getAnalytics()
    res.json({ success: true, data: stats })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})
