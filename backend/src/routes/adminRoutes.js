import { Router } from 'express'
import { authenticateAdmin } from '../utils/auth.js'
import { asyncHandler } from '../utils/errors.js'
import {
  questionOrderSchema,
  questionSchema,
  questionUpdateSchema,
  sectionSchema,
  technologySchema,
  topicOrderSchema,
  topicSchema,
} from '../utils/validation.js'
import * as catalogService from '../services/catalogService.js'
import * as questionService from '../services/questionService.js'

export const adminRouter = Router()
adminRouter.use(authenticateAdmin)

adminRouter.get('/catalog', asyncHandler(async (req, res) => {
  res.json({ technologies: await catalogService.listCatalogForAdmin() })
}))

adminRouter.post('/technologies', asyncHandler(async (req, res) => {
  const technology = await catalogService.createTechnology(technologySchema.parse(req.body))
  res.status(201).json({ technology })
}))

adminRouter.patch('/technologies/:id', asyncHandler(async (req, res) => {
  const technology = await catalogService.updateTechnology(req.params.id, technologySchema.partial().parse(req.body))
  res.json({ technology })
}))

adminRouter.delete('/technologies/:id', asyncHandler(async (req, res) => {
  await catalogService.deleteTechnology(req.params.id)
  res.status(204).end()
}))

adminRouter.post('/technologies/:technologyId/sections', asyncHandler(async (req, res) => {
  const section = await catalogService.createSection(req.params.technologyId, sectionSchema.parse(req.body))
  res.status(201).json({ section })
}))

adminRouter.patch('/sections/:id', asyncHandler(async (req, res) => {
  const section = await catalogService.updateSection(req.params.id, sectionSchema.partial().parse(req.body))
  res.json({ section })
}))

adminRouter.delete('/sections/:id', asyncHandler(async (req, res) => {
  await catalogService.deleteSection(req.params.id)
  res.status(204).end()
}))

adminRouter.post('/sections/:sectionId/topics', asyncHandler(async (req, res) => {
  const topic = await catalogService.createTopic(req.params.sectionId, topicSchema.parse(req.body))
  res.status(201).json({ topic })
}))

adminRouter.patch('/topics/reorder', asyncHandler(async (req, res) => {
  const { sectionId, topicIds } = topicOrderSchema.parse(req.body)
  const topics = await catalogService.reorderTopics(sectionId, topicIds)
  res.json({ topics })
}))

adminRouter.patch('/topics/:id', asyncHandler(async (req, res) => {
  const topic = await catalogService.updateTopic(req.params.id, topicSchema.partial().parse(req.body))
  res.json({ topic })
}))

adminRouter.delete('/topics/:id', asyncHandler(async (req, res) => {
  await catalogService.deleteTopic(req.params.id)
  res.status(204).end()
}))

adminRouter.get('/questions', asyncHandler(async (req, res) => {
  const filter = {}
  for (const key of ['technologyId', 'sectionId', 'topicId']) {
    if (typeof req.query[key] === 'string' && req.query[key]) filter[key] = req.query[key]
  }
  res.json({ questions: await questionService.listQuestions(filter) })
}))

adminRouter.patch('/questions/reorder', asyncHandler(async (req, res) => {
  const { topicId, questionIds } = questionOrderSchema.parse(req.body)
  const questions = await questionService.reorderQuestions(topicId, questionIds)
  res.json({ questions })
}))

adminRouter.post('/questions', asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(questionSchema.parse(req.body))
  res.status(201).json({ question })
}))

adminRouter.patch('/questions/:id', asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(
    req.params.id,
    questionUpdateSchema.parse(req.body),
  )
  res.json({ question })
}))

adminRouter.delete('/questions/:id', asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(req.params.id)
  res.status(204).end()
}))
