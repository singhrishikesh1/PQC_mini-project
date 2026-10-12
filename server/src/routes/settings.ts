import { Router, type Request, type Response } from 'express'
import { getSettings, updateSettings, resetDatabase, getAllData } from '../db'

export const settingsRouter = Router()

// GET /api/settings
settingsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const s = await getSettings()
    res.json({ success: true, data: s })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/settings
settingsRouter.put('/', async (req: Request, res: Response) => {
  try {
    const s = await updateSettings(req.body)
    res.json({ success: true, data: s, message: 'Library settings saved successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/settings/reset
settingsRouter.post('/reset', async (_req: Request, res: Response) => {
  try {
    const result = await resetDatabase()
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/data (Full state snapshot for initial hydration or export)
settingsRouter.get('/snapshot', async (_req: Request, res: Response) => {
  try {
    const snapshot = await getAllData()
    res.json({ success: true, data: snapshot })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})
