import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'
import { config } from '../config/env.js'
import { HttpError } from './errors.js'

export const sessionCookieName = config.isProduction ? '__Host-admin_session' : 'admin_session'

export const sessionCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  path: '/',
}

export async function authenticateAdmin(req, res, next) {
  try {
    const token = req.cookies?.[sessionCookieName]
    if (!token) throw new HttpError(401, 'Authentication required')
    const claims = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] })
    if (typeof claims !== 'object' || typeof claims.sub !== 'string') {
      throw new HttpError(401, 'Invalid session')
    }
    const admin = await Admin.findById(claims.sub).select('_id email isActive')
    if (!admin?.isActive) throw new HttpError(401, 'Invalid session')
    req.admin = admin
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new HttpError(401, 'Invalid or expired session'))
      return
    }
    next(error)
  }
}
