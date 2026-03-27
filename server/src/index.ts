import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'
import { authenticateToken } from './middleware/auth.js'

// Routes
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import activityRoutes from './routes/activities.js'
import deviationRoutes from './routes/deviations.js'
import drawingRoutes from './routes/drawings.js'
import taskRoutes from './routes/tasks.js'
import meetingRoutes from './routes/meetings.js'
import safetyRoundRoutes from './routes/safetyRounds.js'
import dailyLogRoutes from './routes/dailyLogs.js'
import changeOrderRoutes from './routes/changeOrders.js'
import userRoutes from './routes/users.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use(limiter)
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (auth middleware optional for testing)
app.use('/api/projects', projectRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/deviations', deviationRoutes)
app.use('/api/drawings', drawingRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/safety-rounds', safetyRoundRoutes)
app.use('/api/daily-logs', dailyLogRoutes)
app.use('/api/change-orders', changeOrderRoutes)
app.use('/api/users', userRoutes)

// WebSocket
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })

  socket.on('projectUpdate', (data) => {
    io.emit('projectUpdated', data)
  })
})

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export { app, io }
