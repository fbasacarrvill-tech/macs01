import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRoutes from './routes/auth.routes'
import tradesRoutes from './routes/trades.routes'
import analyticsRoutes from './routes/analytics.routes'
import assetsRoutes from './routes/assets.routes'
import strategiesRoutes from './routes/strategies.routes'
import usersRoutes from './routes/users.routes'
import reportsRoutes from './routes/reports.routes'
import subscriptionsRoutes from './routes/subscriptions.routes'
import webhookRoutes from './routes/webhook.routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.BACKEND_PORT ?? 3001

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true }))

// Webhook must be before express.json() to access raw body
app.use('/api/webhooks', webhookRoutes)

app.use(express.json())
app.use(morgan('dev'))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/trades', tradesRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/assets', assetsRoutes)
app.use('/api/strategies', strategiesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/subscriptions', subscriptionsRoutes)

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

export default app
