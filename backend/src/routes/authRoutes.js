import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { authenticateAdmin, sessionCookieName, sessionCookieOptions } from '../utils/auth.js'
import { asyncHandler } from '../utils/errors.js'
import { loginSchema } from '../utils/validation.js'
import { authenticateCredentials } from '../services/authService.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
})

authRouter.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  const { token, admin } = await authenticateCredentials(email, password)
  res.cookie(sessionCookieName, token, {
    ...sessionCookieOptions,
    maxAge: 30 * 60 * 1000,
  })
  res.json({ admin })
}))

authRouter.get('/me', authenticateAdmin, (req, res) => {
  res.json({ admin: { id: req.admin.id, email: req.admin.email } })
})

authRouter.post('/logout', (req, res) => {
  res.clearCookie(sessionCookieName, sessionCookieOptions)
  res.status(204).end()
})
