import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'
import { config } from '../config/env.js'
import { HttpError } from '../utils/errors.js'

export function toAdminResponse(admin) {
  return {
    id: admin.id ?? admin._id.toString(),
    name: admin.name ?? '',
    email: admin.email,
    isActive: admin.isActive === true,
    createdAt: admin.createdAt,
  }
}

export async function authenticateCredentials(email, password) {
  const admin = await Admin.findOne({ email }).select('+passwordHash')
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password')
  }
  // Only revealed after the password matches, so it doesn't leak which emails are registered.
  if (!admin.isActive) {
    throw new HttpError(403, 'Your account is waiting for approval. Ask an existing administrator to activate it.')
  }

  const token = jwt.sign({ sub: admin.id, role: 'admin' }, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  })

  return { token, admin: toAdminResponse(admin) }
}

// New accounts are always inactive. An existing email is ignored silently so the
// response is identical either way and can't be used to discover registered emails.
export async function registerAdmin({ name, email, password }) {
  if (await Admin.exists({ email })) return
  const passwordHash = await bcrypt.hash(password, 12)
  try {
    await Admin.create({ name, email, passwordHash, isActive: false })
  } catch (error) {
    // A parallel registration for the same email won the race; treat it like an existing account.
    if (error?.code !== 11000) throw error
  }
}

export async function listAdmins() {
  const admins = await Admin.find().sort({ isActive: 1, createdAt: -1 }).lean()
  return admins.map(toAdminResponse)
}

export async function setAdminActive(id, isActive, currentAdminId) {
  if (id === currentAdminId && !isActive) {
    throw new HttpError(400, 'You can’t deactivate your own account')
  }
  const admin = await Admin.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true })
  if (!admin) throw new HttpError(404, 'Administrator not found')
  return toAdminResponse(admin)
}

export async function deleteAdmin(id, currentAdminId) {
  if (id === currentAdminId) throw new HttpError(400, 'You can’t delete your own account')
  const admin = await Admin.findByIdAndDelete(id)
  if (!admin) throw new HttpError(404, 'Administrator not found')
}
