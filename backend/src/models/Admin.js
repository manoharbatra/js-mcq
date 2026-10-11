import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 100, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    // Self-registered accounts start inactive and can't sign in until an active admin approves them.
    isActive: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
)

export const Admin = mongoose.model('Admin', adminSchema)
