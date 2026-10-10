import { Router } from 'express'
import { asyncHandler } from '../utils/errors.js'
import { listPublicCatalog } from '../services/catalogService.js'
import * as questionService from '../services/questionService.js'

export const publicRouter = Router()

publicRouter.get('/technologies', asyncHandler(async (req, res) => {
  res.json({ technologies: await listPublicCatalog() })
}))

publicRouter.get(
  '/technologies/:technologySlug/sections/:sectionSlug/topics/:topicSlug/questions',
  asyncHandler(async (req, res) => {
    const { technologySlug, sectionSlug, topicSlug } = req.params
    res.json({ questions: await questionService.listPublicQuestions(technologySlug, sectionSlug, topicSlug) })
  }),
)
