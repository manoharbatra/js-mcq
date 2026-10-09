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
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    subtopic: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    label: { type: String, trim: true, maxlength: 60, default: 'SHORT ANSWER' },
    content: { type: [contentPartSchema], default: [] },
    answer: { type: String, required: true, trim: true, maxlength: 10000 },
    mediumUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    compilerUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  },
  { timestamps: true },
)

questionSchema.index({ topic: 1, subtopic: 1, createdAt: 1 })

export const Question = mongoose.model('Question', questionSchema)
