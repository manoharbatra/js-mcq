import { Question } from '../models/Question.js'
import { Subtopic } from '../models/Subtopic.js'
import { Topic } from '../models/Topic.js'
import { HttpError } from '../utils/errors.js'

export async function listQuestions(filter) {
  return Question.find(filter).sort({ order: 1, createdAt: 1 }).lean()
}

export async function createQuestion(input) {
  const subtopic = await Subtopic.findOne({ _id: input.subtopic, topic: input.topic })
  if (!subtopic) throw new HttpError(400, 'Subtopic must belong to the selected topic')
  return Question.create(input)
}

export async function updateQuestion(id, input) {
  const question = await Question.findById(id)
  if (!question) throw new HttpError(404, 'Question not found')

  const topicId = input.topic ?? question.topic.toString()
  const subtopicId = input.subtopic ?? question.subtopic.toString()
  if (!(await Subtopic.exists({ _id: subtopicId, topic: topicId }))) {
    throw new HttpError(400, 'Subtopic must belong to the selected topic')
  }

  Object.assign(question, input)
  await question.save()
  return question
}

export async function deleteQuestion(id) {
  const question = await Question.findByIdAndDelete(id)
  if (!question) throw new HttpError(404, 'Question not found')
}

export async function listPublishedQuestions(topicSlug, subtopicSlug) {
  const topic = await Topic.findOne({ slug: topicSlug, isPublished: true }).select('_id')
  if (!topic) throw new HttpError(404, 'Topic not found')
  const subtopic = await Subtopic.findOne({
    topic: topic._id,
    slug: subtopicSlug,
    isPublished: true,
  }).select('_id')
  if (!subtopic) throw new HttpError(404, 'Subtopic not found')

  const questions = await Question.find({
    topic: topic._id,
    subtopic: subtopic._id,
    isPublished: true,
  })
    .select('-correctOption -explanation -__v')
    .sort({ order: 1, createdAt: 1 })
    .lean()

  return questions.map(({ _id, title, label, content, options, order }) => ({
    id: _id,
    title,
    label,
    content,
    options,
    order,
  }))
}

export async function submitAnswer(id, optionIndex) {
  const question = await Question.findOne({ _id: id, isPublished: true })
    .select('options correctOption explanation')
  if (!question) throw new HttpError(404, 'Question not found')
  if (optionIndex >= question.options.length) throw new HttpError(400, 'Selected option does not exist')
  return {
    correct: optionIndex === question.correctOption,
    correctOption: question.correctOption,
    explanation: question.explanation,
  }
}
