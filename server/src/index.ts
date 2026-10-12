import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './db'
import { healthRouter } from './routes/health'
import { booksRouter } from './routes/books'
import { membersRouter } from './routes/members'
import { circulationRouter } from './routes/circulation'
import { reservationsRouter } from './routes/reservations'
import { notificationsRouter } from './routes/notifications'
import { settingsRouter } from './routes/settings'
import { analyticsRouter } from './routes/analytics'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Middlewares
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now()
  _res.on('finish', () => {
    const elapsed = Date.now() - start
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${_res.statusCode} (${elapsed}ms)`)
  })
  next()
})

// Route mountings
app.use('/api/health', healthRouter)
app.use('/api/books', booksRouter)
app.use('/api/members', membersRouter)
app.use('/api/circulation', circulationRouter)
app.use('/api/reservations', reservationsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/analytics', analyticsRouter)

// Root API welcome
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'GH Raisoni College of Engineering and Management — Central Library API',
    version: '2.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/health',
      '/api/books',
      '/api/members',
      '/api/circulation/loans',
      '/api/circulation/fines',
      '/api/reservations',
      '/api/notifications',
      '/api/settings',
      '/api/analytics',
    ],
  })
})

// 404 handler for API
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' })
})

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err)
  res.status(500).json({ success: false, error: err?.message || 'Internal server error' })
})

// Start server
async function startServer() {
  const dbStatus = await initDatabase()
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Server] GHRCEM Central Library Express API running on http://localhost:${PORT}`)
    console.log(`   Database: ${dbStatus.message}`)
    console.log(`   API Health: http://localhost:${PORT}/api/health`)
  })
}

startServer().catch(err => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
