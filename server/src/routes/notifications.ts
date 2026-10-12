import { Router, type Request, type Response } from 'express'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../db'

export const notificationsRouter = Router()

// GET /api/notifications
notificationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query
    const list = await getNotifications(memberId as string)
    res.json({ success: true, count: list.length, data: list })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/notifications/:id/read
notificationsRouter.post('/:id/read', async (req: Request, res: Response) => {
  try {
    const result = await markNotificationRead(req.params.id)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/notifications/read-all
notificationsRouter.post('/read-all', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.body
    const result = await markAllNotificationsRead(memberId)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})
