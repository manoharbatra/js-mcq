import { z } from 'zod'

const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const optionalHttpUrlSchema = z.union([
  z.literal(''),
  z.string().trim().max(2048).url().refine((value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  }, 'URL must use HTTP or HTTPS'),
]).optional().default('')
const contentPartSchema = z.object({
  kind: z.enum(['text', 'code', 'json']),
  value: z.union([z.string().max(20000), z.record(z.string(), z.unknown())]),
}).strict()

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
}).strict()

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i)
const nameSchema = z.string().trim().min(1).max(100)
const orderSchema = z.number().int().min(0).max(100000)

export const technologySchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  icon: z.string().trim().toLowerCase().max(50).regex(/^[a-z0-9-]*$/).optional(),
  order: orderSchema.optional(),
  isActive: z.boolean().optional(),
}).strict()

export const sectionSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  order: orderSchema.optional(),
  isActive: z.boolean().optional(),
}).strict()

export const topicSchema = sectionSchema

// Questions only name their topic; the service derives the technology and section from it.
const questionFieldsSchema = z.object({
  topicId: objectIdSchema,
  title: z.string().trim().min(1).max(300),
  label: z.string().trim().max(60).optional().default('SHORT ANSWER'),
  content: z.array(contentPartSchema).max(20).optional().default([]),
  answer: z.string().trim().min(1).max(10000),
  mediumUrl: optionalHttpUrlSchema,
  compilerUrl: optionalHttpUrlSchema,
}).strict()

export const questionSchema = questionFieldsSchema

export const questionUpdateSchema = questionFieldsSchema.partial()

export const questionOrderSchema = z.object({
  topicId: objectIdSchema,
  questionIds: z.array(objectIdSchema).min(1).max(1000),
}).strict().superRefine(({ questionIds }, context) => {
  if (new Set(questionIds.map((id) => id.toLowerCase())).size !== questionIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['questionIds'],
      message: 'Question IDs must be unique',
    })
  }
})
