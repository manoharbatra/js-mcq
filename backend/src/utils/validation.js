import { z } from 'zod'

const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const descriptionSchema = z.string().trim().max(500).optional().default('')
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

export const topicSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  description: descriptionSchema,
}).strict()

export const subtopicSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  description: descriptionSchema,
}).strict()

const questionFieldsSchema = z.object({
  topic: z.string().regex(/^[a-f\d]{24}$/i),
  subtopic: z.string().regex(/^[a-f\d]{24}$/i),
  title: z.string().trim().min(1).max(300),
  label: z.string().trim().max(60).optional().default('SHORT ANSWER'),
  content: z.array(contentPartSchema).max(20).optional().default([]),
  answer: z.string().trim().min(1).max(10000),
  mediumUrl: optionalHttpUrlSchema,
  compilerUrl: optionalHttpUrlSchema,
}).strict()

export const questionSchema = questionFieldsSchema

export const questionUpdateSchema = questionFieldsSchema.partial()
