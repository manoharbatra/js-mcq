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
    label: { type: String, trim: true, maxlength: 60, default: 'MULTIPLE CHOICE' },
    content: { type: [contentPartSchema], default: [] },
    options: {
      type: [{ type: String, trim: true, maxlength: 1000 }],
      required: true,
      validate: {
        validator: (options) => options.length >= 2 && options.length <= 6,
        message: 'A question must have between 2 and 6 options',
      },
    },
    correctOption: { type: Number, required: true, min: 0 },
    explanation: { type: String, required: true, trim: true, maxlength: 10000 },
    order: { type: Number, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
)

questionSchema.index({ topic: 1, subtopic: 1, isPublished: 1, order: 1 })
questionSchema.pre('validate', function validateCorrectOption() {
  if (this.correctOption >= this.options.length) {
    this.invalidate('correctOption', 'correctOption must refer to an existing option')
  }
})

export const Question = mongoose.model('Question', questionSchema)
