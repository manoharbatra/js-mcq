import { app } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { config } from './config/env.js'

await connectDatabase()

const server = app.listen(config.PORT, () => {
  console.log(`JS MCQ API listening on port ${config.PORT}`)
})

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`)
  server.close(async (error) => {
    if (error) {
      console.error(error)
      process.exitCode = 1
    }
    await disconnectDatabase()
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
