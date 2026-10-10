import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:5174'),
  JWT_EXPIRES_IN: z.string().default('30m'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  throw new Error(`Invalid backend configuration: ${z.prettifyError(parsed.error)}`)
}

export const config = {
  ...parsed.data,
  allowedOrigins: [parsed.data.CLIENT_ORIGIN, parsed.data.ADMIN_ORIGIN],
  isProduction: parsed.data.NODE_ENV === 'production',
}
