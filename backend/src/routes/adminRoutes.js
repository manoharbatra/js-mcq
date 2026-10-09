import { Router } from 'express'
import { authenticateAdmin } from '../utils/auth.js'
import { asyncHandler } from '../utils/errors.js'
import { questionSchema, questionUpdateSchema, subtopicSchema, topicSchema } from '../utils/validation.js'
import * as questionService from '../services/questionService.js'
import * as topicService from '../services/topicService.js'

export const adminRouter = Router()
adminRouter.use(authenticateAdmin)

adminRouter.get('/topics', asyncHandler(async (req, res) => {
  res.json({ topics: await topicService.listTopicsForAdmin() })
}))

adminRouter.post('/topics', asyncHandler(async (req, res) => {
  const topic = await topicService.createTopic(topicSchema.parse(req.body))
  res.status(201).json({ topic })
}))

adminRouter.patch('/topics/:id', asyncHandler(async (req, res) => {
  const topic = await topicService.updateTopic(req.params.id, topicSchema.partial().parse(req.body))
  res.json({ topic })
}))

adminRouter.delete('/topics/:id', asyncHandler(async (req, res) => {
  await topicService.deleteTopic(req.params.id)
  res.status(204).end()
}))

adminRouter.post('/topics/:topicId/subtopics', asyncHandler(async (req, res) => {
  const subtopic = await topicService.createSubtopic(req.params.topicId, subtopicSchema.parse(req.body))
  res.status(201).json({ subtopic })
}))

adminRouter.patch('/subtopics/:id', asyncHandler(async (req, res) => {
  const subtopic = await topicService.updateSubtopic(req.params.id, subtopicSchema.partial().parse(req.body))
  res.json({ subtopic })
}))

adminRouter.delete('/subtopics/:id', asyncHandler(async (req, res) => {
  await topicService.deleteSubtopic(req.params.id)
  res.status(204).end()
}))

adminRouter.get('/questions', asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.topic) filter.topic = req.query.topic
  if (req.query.subtopic) filter.subtopic = req.query.subtopic
  res.json({ questions: await questionService.listQuestions(filter) })
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
