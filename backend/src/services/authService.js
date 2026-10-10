import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'
import { config } from '../config/env.js'
import { HttpError } from '../utils/errors.js'

export async function authenticateCredentials(email, password) {
  const admin = await Admin.findOne({ email }).select('+passwordHash')
  if (!admin || !admin.isActive || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password')
  }

  const token = jwt.sign({ sub: admin.id, role: 'admin' }, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  })

  return {
    token,
    admin: { id: admin.id, email: admin.email },
  }
}
