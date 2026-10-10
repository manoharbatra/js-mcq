// One-off migration from the old Topic › Subtopic › Question structure to
// Technology › Section › Topic › Question.
//
//   old topic     → technology (same _id)
//   (new)         → one section per technology, named MIGRATION_SECTION_NAME (default "Output Based")
//   old subtopic  → topic inside that section (same _id)
//   question      → topic/subtopic refs become technologyId/sectionId/topicId; content is untouched
//
// Runs as a dry run by default. Pass --apply to write. A JSON backup of the old records is saved first.
import mongoose from 'mongoose'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { config } from '../src/config/env.js'
import { Question } from '../src/models/Question.js'
import { Section } from '../src/models/Section.js'
import { Technology } from '../src/models/Technology.js'
import { Topic } from '../src/models/Topic.js'

const apply = process.argv.includes('--apply')
const sectionName = process.env.MIGRATION_SECTION_NAME?.trim() || 'Output Based'
const sectionSlug = sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function idKey(id) {
  return id?.toString() ?? ''
}

try {
  await mongoose.connect(config.MONGODB_URI, { autoIndex: false })
  const db = mongoose.connection.db
  const collections = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name))

  if (collections.has('technologies') && await db.collection('technologies').countDocuments()) {
    throw new Error('The technologies collection already has data; this database looks migrated already.')
  }

  const oldTopics = collections.has('topics') ? await db.collection('topics').find().sort({ name: 1 }).toArray() : []
  const oldSubtopics = collections.has('subtopics') ? await db.collection('subtopics').find().sort({ name: 1 }).toArray() : []
  const questions = collections.has('questions')
    ? await db.collection('questions').find({}, { projection: { topic: 1, subtopic: 1, title: 1 } }).toArray()
    : []

  if (oldTopics.some((topic) => topic.sectionId)) {
    throw new Error('The topics collection already uses the new structure (records have sectionId).')
  }

  const topicIds = new Set(oldTopics.map(({ _id }) => idKey(_id)))
  const subtopicsById = new Map(oldSubtopics.map((subtopic) => [idKey(subtopic._id), subtopic]))
  const orphanSubtopics = oldSubtopics.filter((subtopic) => !topicIds.has(idKey(subtopic.topic)))
  const orphanQuestions = questions.filter((question) => {
    const subtopic = subtopicsById.get(idKey(question.subtopic))
    return !subtopic || idKey(subtopic.topic) !== idKey(question.topic)
  })
  if (orphanSubtopics.length || orphanQuestions.length) {
    throw new Error(
      `Found ${orphanSubtopics.length} subtopic(s) and ${orphanQuestions.length} question(s) whose parent is missing or mismatched; `
      + 'fix them before migrating.',
    )
  }

  const sectionByTechnology = new Map(oldTopics.map((topic) => [idKey(topic._id), new mongoose.Types.ObjectId()]))

  console.log(`${apply ? 'Migrating' : 'Dry run —'} ${oldTopics.length} technologies, ${oldSubtopics.length} topics, ${questions.length} questions`)
  console.log(`Each technology gets one section: "${sectionName}" (/${sectionSlug})\n`)
  for (const topic of oldTopics) {
    console.log(`${topic.name}  /${topic.slug}`)
    console.log(`  └ ${sectionName}`)
    for (const subtopic of oldSubtopics.filter((item) => idKey(item.topic) === idKey(topic._id))) {
      const count = questions.filter((question) => idKey(question.subtopic) === idKey(subtopic._id)).length
      console.log(`      └ ${subtopic.name}  /${topic.slug}/${sectionSlug}/${subtopic.slug}  (${count} questions)`)
    }
  }

  if (!apply) {
    console.log('\nNothing was written. Re-run with --apply to migrate.')
  } else if (!oldTopics.length) {
    console.log('\nNo old records to migrate; syncing indexes only.')
  } else {
    const backupDir = fileURLToPath(new URL('../backups/', import.meta.url))
    const backupFile = `${backupDir}catalog-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    await mkdir(backupDir, { recursive: true })
    await writeFile(backupFile, JSON.stringify({ topics: oldTopics, subtopics: oldSubtopics, questions }, null, 2))
    console.log(`\nBackup written to ${backupFile}`)

    const now = new Date()
    await db.collection('technologies').insertMany(oldTopics.map((topic, index) => ({
      _id: topic._id,
      name: topic.name,
      slug: topic.slug,
      icon: topic.slug,
      order: index + 1,
      isActive: true,
      createdAt: topic.createdAt ?? now,
      updatedAt: now,
    })))

    await db.collection('sections').insertMany(oldTopics.map((topic) => ({
      _id: sectionByTechnology.get(idKey(topic._id)),
      technologyId: topic._id,
      name: sectionName,
      slug: sectionSlug,
      order: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })))

    for (const subtopic of oldSubtopics) {
      await db.collection('questions').updateMany(
        { subtopic: subtopic._id },
        [
          {
            $set: {
              technologyId: subtopic.topic,
              sectionId: sectionByTechnology.get(idKey(subtopic.topic)),
              topicId: subtopic._id,
            },
          },
          { $unset: ['topic', 'subtopic'] },
        ],
      )
    }

    // The old topics collection held top-level records; it is rebuilt to hold the new third level.
    await db.collection('topics').drop()
    if (oldSubtopics.length) {
      const orderByTechnology = new Map()
      await db.collection('topics').insertMany(oldSubtopics.map((subtopic) => {
        const technologyKey = idKey(subtopic.topic)
        const order = (orderByTechnology.get(technologyKey) ?? 0) + 1
        orderByTechnology.set(technologyKey, order)
        return {
          _id: subtopic._id,
          technologyId: subtopic.topic,
          sectionId: sectionByTechnology.get(technologyKey),
          name: subtopic.name,
          slug: subtopic.slug,
          order,
          isActive: true,
          createdAt: subtopic.createdAt ?? now,
          updatedAt: now,
        }
      }))
    }
    if (collections.has('subtopics')) await db.collection('subtopics').drop()
  }

  if (apply) {
    for (const Model of [Technology, Section, Topic, Question]) await Model.syncIndexes()
    console.log('Indexes synced. Migration complete.')
  }
} finally {
  await mongoose.disconnect()
}
