import mongoose from 'mongoose'

// A topic belongs to one section, so the same name (e.g. "Closures") can exist in several sections.
const topicSchema = new mongoose.Schema(
  {
    technologyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technology', required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    mediumUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    order: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

topicSchema.index({ sectionId: 1, slug: 1 }, { unique: true })

export const Topic = mongoose.model('Topic', topicSchema)
