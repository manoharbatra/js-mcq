import mongoose from 'mongoose'
import { config } from './env.js'

export async function connectDatabase() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(config.MONGODB_URI)
  console.log(`MongoDB connected (${mongoose.connection.name})`)
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
