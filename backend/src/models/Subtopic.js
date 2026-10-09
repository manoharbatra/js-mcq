import mongoose from 'mongoose'

const subtopicSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    order: { type: Number, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
)

subtopicSchema.index({ topic: 1, slug: 1 }, { unique: true })

export const Subtopic = mongoose.model('Subtopic', subtopicSchema)
