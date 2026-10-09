import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true, required: true },
  },
  { timestamps: true },
)

export const Admin = mongoose.model('Admin', adminSchema)
