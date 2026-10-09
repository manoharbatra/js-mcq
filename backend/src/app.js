import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { config } from './config/env.js'
import { HttpError, errorHandler, notFoundHandler } from './utils/errors.js'
import { adminRouter } from './routes/adminRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import { publicRouter } from './routes/publicRoutes.js'

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new HttpError(403, 'Origin is not allowed'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '32kb', strict: true }))
app.use(cookieParser())

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.get('origin')
    if (origin && !config.allowedOrigins.includes(origin)) {
      next(new HttpError(403, 'Origin is not allowed'))
      return
    }
  }
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/public', publicRouter)
app.use(notFoundHandler)
app.use(errorHandler)
