import mongoose from 'mongoose'

const contentPartSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['text', 'code', 'json'], required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false },
)

const questionSchema = new mongoose.Schema(
  {
    technologyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technology', required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    displayOrder: { type: Number, required: true, min: 0, default: 0 },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    label: { type: String, trim: true, maxlength: 60, default: 'SHORT ANSWER' },
    content: { type: [contentPartSchema], default: [] },
    answer: { type: String, required: true, trim: true, maxlength: 10000 },
    mediumUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    compilerUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    // true: premium content (medium link withheld, membership prompt shown); false: free.
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
)

questionSchema.index({ topicId: 1, displayOrder: 1, createdAt: 1 })

export const Question = mongoose.model('Question', questionSchema)
