import { z } from 'zod'

const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const descriptionSchema = z.string().trim().max(500).optional().default('')
const orderSchema = z.number().int().min(0).max(100000).optional().default(0)
const publishedSchema = z.boolean().optional().default(false)
const contentPartSchema = z.object({
  kind: z.enum(['text', 'code', 'json']),
  value: z.union([z.string().max(20000), z.record(z.string(), z.unknown())]),
}).strict()

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
}).strict()

export const topicSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  description: descriptionSchema,
  order: orderSchema,
  isPublished: publishedSchema,
}).strict()

export const subtopicSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  description: descriptionSchema,
  order: orderSchema,
  isPublished: publishedSchema,
}).strict()

const questionFieldsSchema = z.object({
  topic: z.string().regex(/^[a-f\d]{24}$/i),
  subtopic: z.string().regex(/^[a-f\d]{24}$/i),
  title: z.string().trim().min(1).max(300),
  label: z.string().trim().max(60).optional().default('MULTIPLE CHOICE'),
  content: z.array(contentPartSchema).max(20).optional().default([]),
  options: z.array(z.string().trim().min(1).max(1000)).min(2).max(6),
  correctOption: z.number().int().min(0),
  explanation: z.string().trim().min(1).max(10000),
  order: orderSchema,
  isPublished: publishedSchema,
}).strict()

export const questionSchema = questionFieldsSchema.refine((value) => value.correctOption < value.options.length, {
  path: ['correctOption'],
  message: 'Select an existing option',
})

export const questionUpdateSchema = questionFieldsSchema.partial().refine((value) => (
  value.correctOption === undefined
  || value.options === undefined
  || value.correctOption < value.options.length
), {
  path: ['correctOption'],
  message: 'Select an existing option',
})

export const answerSchema = z.object({
  optionIndex: z.number().int().min(0).max(5),
}).strict()
