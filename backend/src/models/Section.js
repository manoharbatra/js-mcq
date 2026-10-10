import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema(
  {
    technologyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technology', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    order: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

sectionSchema.index({ technologyId: 1, slug: 1 }, { unique: true })

export const Section = mongoose.model('Section', sectionSchema)
