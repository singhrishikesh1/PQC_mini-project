import { Router, type Request, type Response } from 'express'
import { isPostgresConnected } from '../db'

export const healthRouter = Router()

healthRouter.get('/', (_req: Request, res: Response) => {
  const isPostgres = isPostgresConnected()
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    institute: 'GH Raisoni College of Engineering and Management',
    system: 'Central Digital Library Management System API',
    database: {
      orm: 'Prisma ORM (v6.19.3)',
      engine: isPostgres ? 'PostgreSQL (Active)' : 'PostgreSQL Adapter (Local Persistent Store Active)',
      connected: true,
    },
    version: '2.0.0',
  })
})
