import { Router, type Request, type Response } from 'express'
import { getBooks, getBookById, saveBook, archiveBook, manageCopies, getCategories } from '../db'

export const booksRouter = Router()

// GET /api/categories
booksRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const list = await getCategories()
    res.json({ success: true, data: list })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/books
booksRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { search, categoryId, status, limit, offset } = req.query
    const result = await getBooks({
      search: search as string,
      categoryId: categoryId as string,
      status: status as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    })
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/books/:id
booksRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const book = await getBookById(req.params.id)
    if (!book) {
      res.status(404).json({ success: false, error: 'Book not found' })
      return
    }
    res.json({ success: true, data: book })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/books
booksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const book = await saveBook(req.body)
    res.status(201).json({ success: true, data: book, message: `Created "${book.title}"` })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// PUT /api/books/:id
booksRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const book = await saveBook(req.body, req.params.id)
    res.json({ success: true, data: book, message: `Updated "${book.title}"` })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// DELETE /api/books/:id (Archive)
booksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await archiveBook(req.params.id)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST /api/books/:id/copies
booksRouter.post('/:id/copies', async (req: Request, res: Response) => {
  try {
    const { count } = req.body
    if (typeof count !== 'number' || count < 0) {
      res.status(400).json({ success: false, error: 'Provide a valid copy count' })
      return
    }
    const result = await manageCopies(req.params.id, count)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})
