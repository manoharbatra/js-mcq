import mongoose from 'mongoose'

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    order: { type: Number, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
)

topicSchema.index({ slug: 1 }, { unique: true })

export const Topic = mongoose.model('Topic', topicSchema)
