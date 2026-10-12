import { Router, type Request, type Response } from 'express'
import { getReservations, createReservation, cancelReservation } from '../db'

export const reservationsRouter = Router()

// GET /api/reservations
reservationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { memberId, bookId, status } = req.query
    const list = await getReservations({
      memberId: memberId as string,
      bookId: bookId as string,
      status: status as string,
    })
    res.json({ success: true, count: list.length, data: list })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/reservations
reservationsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, bookId } = req.body
    if (!memberId || !bookId) {
      res.status(400).json({ success: false, error: 'Both memberId and bookId are required' })
      return
    }
    const resv = await createReservation(memberId, bookId)
    res.status(201).json({ success: true, data: resv, message: 'Reservation placed successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/reservations/:id/cancel
reservationsRouter.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const resv = await cancelReservation(req.params.id)
    res.json({ success: true, data: resv, message: 'Reservation cancelled' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})
