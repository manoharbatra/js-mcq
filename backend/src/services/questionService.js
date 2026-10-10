import { Question } from '../models/Question.js'
import { Topic } from '../models/Topic.js'
import { HttpError } from '../utils/errors.js'
import { findPublicTopic } from './catalogService.js'

export async function listQuestions(filter) {
  return Question.find(filter)
    .select('technologyId sectionId topicId displayOrder title label content answer mediumUrl compilerUrl isPaid createdAt updatedAt')
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .lean()
}

// Questions are placed by topic; the technology and section are always copied from that topic.
async function resolvePlacement(topicId) {
  const topic = await Topic.findById(topicId).select('technologyId sectionId').lean()
  if (!topic) throw new HttpError(400, 'Choose an existing topic')
  return { technologyId: topic.technologyId, sectionId: topic.sectionId, topicId: topic._id }
}

async function nextDisplayOrder(topicId) {
  const lastQuestion = await Question.findOne({ topicId })
    .sort({ displayOrder: -1, createdAt: -1 })
    .select('displayOrder')
    .lean()
  return Number(lastQuestion?.displayOrder ?? 0) + (lastQuestion ? 1 : 0)
}

export async function createQuestion(input) {
  const placement = await resolvePlacement(input.topicId)
  return Question.create({
    ...input,
    ...placement,
    displayOrder: await nextDisplayOrder(placement.topicId),
  })
}

export async function updateQuestion(id, input) {
  const question = await Question.findById(id)
  if (!question) throw new HttpError(404, 'Question not found')

  const { topicId, ...fields } = input
  if (topicId && topicId !== question.topicId.toString()) {
    const placement = await resolvePlacement(topicId)
    Object.assign(fields, placement, { displayOrder: await nextDisplayOrder(placement.topicId) })
  }

  Object.assign(question, fields)
  await question.save()
  return question
}

export async function reorderQuestions(topicId, questionIds) {
  const questions = await Question.find({ topicId })
    .select('_id')
    .lean()
  if (questions.length !== questionIds.length) {
    throw new HttpError(400, 'The order must include every question in the selected topic')
  }

  const existingIds = new Set(questions.map(({ _id }) => _id.toString()))
  if (questionIds.some((id) => !existingIds.has(id.toLowerCase()))) {
    throw new HttpError(400, 'The order contains a question outside the selected topic')
  }

  await Question.bulkWrite(questionIds.map((id, displayOrder) => ({
    updateOne: {
      filter: { _id: id, topicId },
      update: { $set: { displayOrder } },
    },
  })))
  return listQuestions({ topicId })
}

export async function deleteQuestion(id) {
  const question = await Question.findByIdAndDelete(id)
  if (!question) throw new HttpError(404, 'Question not found')
}

export async function listPublicQuestions(technologySlug, sectionSlug, topicSlug) {
  const topic = await findPublicTopic(technologySlug, sectionSlug, topicSlug)
  // A premium topic exposes none of its questions, however the page was reached.
  if (topic.isPaid === true) return []

  const questions = await Question.find({ topicId: topic._id })
    .select('title label content answer mediumUrl compilerUrl isPaid')
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .lean()

  return questions.map(({ _id, title, label, content, answer, mediumUrl, compilerUrl, isPaid = false }) => ({
    id: _id,
    title,
    label,
    content,
    // Premium content is withheld server-side so it can't be read from the API response.
    answer: isPaid ? '' : answer,
    mediumUrl: isPaid ? '' : mediumUrl,
    compilerUrl: isPaid ? '' : compilerUrl,
    isPaid,
  }))
}
