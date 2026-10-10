import mongoose from 'mongoose'

const technologySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    icon: { type: String, trim: true, lowercase: true, maxlength: 50, default: '' },
    order: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

technologySchema.index({ slug: 1 }, { unique: true })
technologySchema.index({ order: 1, name: 1 })

export const Technology = mongoose.model('Technology', technologySchema)
