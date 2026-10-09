import { Router } from 'express'
import { asyncHandler } from '../utils/errors.js'
import * as questionService from '../services/questionService.js'
import { listPublicTopics } from '../services/topicService.js'

export const publicRouter = Router()

publicRouter.get('/topics', asyncHandler(async (req, res) => {
  res.json({ topics: await listPublicTopics() })
}))

publicRouter.get('/topics/:topicSlug/subtopics/:subtopicSlug/questions', asyncHandler(async (req, res) => {
  const questions = await questionService.listPublicQuestions(
    req.params.topicSlug,
    req.params.subtopicSlug,
  )
  res.json({ questions })
}))
