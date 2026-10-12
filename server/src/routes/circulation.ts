import { Router, type Request, type Response } from 'express'
import { getLoans, issueBook, returnBook, renewLoan, getFines, payFine, waiveFine } from '../db'

export const circulationRouter = Router()

// GET /api/loans
circulationRouter.get('/loans', async (req: Request, res: Response) => {
  try {
    const { memberId, status, overdueOnly } = req.query
    const list = await getLoans({
      memberId: memberId as string,
      status: status as string,
      overdueOnly: overdueOnly === 'true',
    })
    res.json({ success: true, count: list.length, data: list })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/loans/issue
circulationRouter.post('/loans/issue', async (req: Request, res: Response) => {
  try {
    const { memberId, copyId, issueDate, dueDate } = req.body
    if (!memberId || !copyId) {
      res.status(400).json({ success: false, error: 'Both memberId and copyId are required' })
      return
    }
    const loan = await issueBook(memberId, copyId, issueDate, dueDate)
    res.status(201).json({ success: true, data: loan, message: 'Book issued successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/loans/:id/return
circulationRouter.post('/loans/:id/return', async (req: Request, res: Response) => {
  try {
    const { condition } = req.body
    const loan = await returnBook(req.params.id, condition)
    res.json({ success: true, data: loan, message: 'Book returned successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/loans/:id/renew
circulationRouter.post('/loans/:id/renew', async (req: Request, res: Response) => {
  try {
    const loan = await renewLoan(req.params.id)
    res.json({ success: true, data: loan, message: 'Loan renewed successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// GET /api/fines
circulationRouter.get('/fines', async (req: Request, res: Response) => {
  try {
    const { memberId, status } = req.query
    const list = await getFines({
      memberId: memberId as string,
      status: status as string,
    })
    res.json({ success: true, count: list.length, data: list })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/fines/:id/pay
circulationRouter.post('/fines/:id/pay', async (req: Request, res: Response) => {
  try {
    const fine = await payFine(req.params.id)
    res.json({ success: true, data: fine, message: 'Fine cleared successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/fines/:id/waive
circulationRouter.post('/fines/:id/waive', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body
    const fine = await waiveFine(req.params.id, reason)
    res.json({ success: true, data: fine, message: 'Fine waived successfully' })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})
