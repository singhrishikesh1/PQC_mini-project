import { Router, type Request, type Response } from 'express'
import { getMembers, getMemberById, saveMember } from '../db'

export const membersRouter = Router()

// GET /api/members
membersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { search, type, status } = req.query
    const list = await getMembers({
      search: search as string,
      type: type as string,
      status: status as string,
    })
    res.json({ success: true, count: list.length, data: list })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/members/:id
membersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await getMemberById(req.params.id)
    if (!member) {
      res.status(404).json({ success: false, error: 'Member not found' })
      return
    }
    res.json({ success: true, data: member })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/members
membersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const member = await saveMember(req.body)
    res.status(201).json({ success: true, data: member, message: `Enrolled ${member.name}` })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// PUT /api/members/:id
membersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const member = await saveMember(req.body, req.params.id)
    res.json({ success: true, data: member, message: `Updated ${member.name}` })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})
