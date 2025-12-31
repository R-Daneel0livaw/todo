import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import tasksRouter from './routes/tasks.js'
import eventsRouter from './routes/events.js'
import collectionsRouter from './routes/collections.js'
import dependenciesRouter from './routes/dependencies.js'
import activityRouter from './routes/activity.js'
import vmsRouter from './routes/vms.js'

const app: Express = express()
const PORT = process.env.PORT || 3333

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:*',
  credentials: true
}))

app.use(express.json())

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'journal-mcp'
  })
})

// API Routes
app.use('/api/tasks', tasksRouter)
app.use('/api/events', eventsRouter)
app.use('/api/collections', collectionsRouter)
app.use('/api/dependencies', dependenciesRouter)
app.use('/api/activity', activityRouter)
app.use('/api/vms', vmsRouter)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

export function startServer(): void {
  app.listen(PORT, () => {
    console.log(`Journal MCP HTTP Server running on http://localhost:${PORT}`)
  })
}

export { app }
