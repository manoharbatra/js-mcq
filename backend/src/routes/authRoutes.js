import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { authenticateAdmin, sessionCookieName, sessionCookieOptions } from '../utils/auth.js'
import { asyncHandler } from '../utils/errors.js'
import { loginSchema, registerSchema } from '../utils/validation.js'
import { authenticateCredentials, registerAdmin, toAdminResponse } from '../services/authService.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many registration attempts. Try again later.' },
})

// Creates an inactive account; an active administrator must approve it before it can sign in.
authRouter.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  await registerAdmin(registerSchema.parse(req.body))
  res.status(202).json({
    message: 'Registration received. An administrator must approve your account before you can sign in.',
  })
}))

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
  res.json({ admin: toAdminResponse(req.admin) })
})

authRouter.post('/logout', (req, res) => {
  res.clearCookie(sessionCookieName, sessionCookieOptions)
  res.status(204).end()
})
