import { Router } from 'express'
import { asyncHandler } from '../utils/errors.js'
import { answerSchema } from '../utils/validation.js'
import * as questionService from '../services/questionService.js'
import { listPublishedTopics } from '../services/topicService.js'

export const publicRouter = Router()

publicRouter.get('/topics', asyncHandler(async (req, res) => {
  res.json({ topics: await listPublishedTopics() })
}))

publicRouter.get('/topics/:topicSlug/subtopics/:subtopicSlug/questions', asyncHandler(async (req, res) => {
  const questions = await questionService.listPublishedQuestions(
    req.params.topicSlug,
    req.params.subtopicSlug,
  )
  res.json({ questions })
}))

publicRouter.post('/questions/:id/answer', asyncHandler(async (req, res) => {
  const { optionIndex } = answerSchema.parse(req.body)
  const answer = await questionService.submitAnswer(req.params.id, optionIndex)
  res.json(answer)
}))
