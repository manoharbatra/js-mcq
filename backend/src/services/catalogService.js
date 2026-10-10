import { Question } from '../models/Question.js'
import { Section } from '../models/Section.js'
import { Technology } from '../models/Technology.js'
import { Topic } from '../models/Topic.js'
import { HttpError } from '../utils/errors.js'
import { escapeRegExp, uniqueSlug } from '../utils/slug.js'

const sortByOrder = { order: 1, name: 1 }

function groupBy(items, key) {
  const groups = new Map()
  for (const item of items) {
    const id = item[key].toString()
    const group = groups.get(id) ?? []
    group.push(item)
    groups.set(id, group)
  }
  return groups
}

// New records are appended after their siblings unless the admin chose an order.
async function nextOrder(Model, filter) {
  const last = await Model.findOne(filter).sort({ order: -1 }).select('order').lean()
  return last ? last.order + 1 : 1
}

async function countQuestionsByTopic(match = {}) {
  const counts = await Question.aggregate([
    { $match: match },
    { $group: { _id: '$topicId', count: { $sum: 1 } } },
  ])
  return new Map(counts.map(({ _id, count }) => [_id.toString(), count]))
}

export async function listCatalogForAdmin() {
  const [technologies, sections, topics, questionCounts] = await Promise.all([
    Technology.find().sort(sortByOrder).lean(),
    Section.find().sort(sortByOrder).lean(),
    Topic.find().sort(sortByOrder).lean(),
    countQuestionsByTopic(),
  ])
  const sectionsByTechnology = groupBy(sections, 'technologyId')
  const topicsBySection = groupBy(topics, 'sectionId')

  return technologies.map((technology) => ({
    ...technology,
    sections: (sectionsByTechnology.get(technology._id.toString()) ?? []).map((section) => ({
      ...section,
      topics: (topicsBySection.get(section._id.toString()) ?? []).map((topic) => ({
        ...topic,
        questionCount: questionCounts.get(topic._id.toString()) ?? 0,
      })),
    })),
  }))
}

export async function listPublicCatalog() {
  const [technologies, sections, topics, questionCounts] = await Promise.all([
    Technology.find({ isActive: true }).select('name slug icon').sort(sortByOrder).lean(),
    Section.find({ isActive: true }).select('technologyId name slug').sort(sortByOrder).lean(),
    Topic.find({ isActive: true }).select('sectionId name slug mediumUrl').sort(sortByOrder).lean(),
    countQuestionsByTopic(),
  ])
  const sectionsByTechnology = groupBy(sections, 'technologyId')
  const topicsBySection = groupBy(topics, 'sectionId')

  return technologies.map((technology) => ({
    id: technology._id,
    name: technology.name,
    slug: technology.slug,
    icon: technology.icon,
    sections: (sectionsByTechnology.get(technology._id.toString()) ?? []).map((section) => {
      const sectionTopics = (topicsBySection.get(section._id.toString()) ?? []).map((topic) => ({
        id: topic._id,
        name: topic.name,
        slug: topic.slug,
        mediumUrl: topic.mediumUrl ?? '',
        questionCount: questionCounts.get(topic._id.toString()) ?? 0,
      }))
      return {
        id: section._id,
        name: section.name,
        slug: section.slug,
        questionCount: sectionTopics.reduce((sum, topic) => sum + topic.questionCount, 0),
        topics: sectionTopics,
      }
    }),
  }))
}

// Resolves an active technology › section › topic slug path, or throws 404.
export async function findPublicTopic(technologySlug, sectionSlug, topicSlug) {
  const technology = await Technology.findOne({ slug: technologySlug, isActive: true }).select('_id').lean()
  if (!technology) throw new HttpError(404, 'Technology not found')
  const section = await Section.findOne({ technologyId: technology._id, slug: sectionSlug, isActive: true }).select('_id').lean()
  if (!section) throw new HttpError(404, 'Section not found')
  const topic = await Topic.findOne({ sectionId: section._id, slug: topicSlug, isActive: true }).select('_id').lean()
  if (!topic) throw new HttpError(404, 'Topic not found')
  return topic
}

// Names are unique (case-insensitively) among siblings, and the slug always follows the name.
async function withNameAndSlug(Model, input, scope, { current, kind, parentLabel }) {
  if (input.name === undefined || (current && input.name === current.name)) return input
  const duplicate = await Model.exists({
    ...scope,
    name: new RegExp(`^${escapeRegExp(input.name)}$`, 'i'),
    ...(current ? { _id: { $ne: current._id } } : {}),
  })
  if (duplicate) {
    throw new HttpError(409, `A ${kind} named “${input.name}” already exists${parentLabel ? ` in ${parentLabel}` : ''}`)
  }
  return { ...input, slug: await uniqueSlug(Model, input.name, scope, current?._id, kind) }
}

async function saveChanges(document, changes) {
  Object.assign(document, changes)
  await document.save()
  return document
}

export async function createTechnology(input) {
  const data = await withNameAndSlug(Technology, input, {}, { kind: 'technology' })
  return Technology.create({ ...data, order: input.order ?? await nextOrder(Technology, {}) })
}

export async function updateTechnology(id, input) {
  const technology = await Technology.findById(id)
  if (!technology) throw new HttpError(404, 'Technology not found')
  return saveChanges(technology, await withNameAndSlug(Technology, input, {}, { current: technology, kind: 'technology' }))
}

export async function deleteTechnology(id) {
  if (await Section.exists({ technologyId: id })) {
    throw new HttpError(409, 'Delete this technology’s sections first')
  }
  const technology = await Technology.findByIdAndDelete(id)
  if (!technology) throw new HttpError(404, 'Technology not found')
}

export async function createSection(technologyId, input) {
  const technology = await Technology.findById(technologyId).select('_id name')
  if (!technology) throw new HttpError(404, 'Technology not found')
  const scope = { technologyId: technology._id }
  const data = await withNameAndSlug(Section, input, scope, { kind: 'section', parentLabel: technology.name })
  return Section.create({
    ...data,
    technologyId: technology._id,
    order: input.order ?? await nextOrder(Section, { technologyId: technology._id }),
  })
}

export async function updateSection(id, input) {
  const section = await Section.findById(id)
  if (!section) throw new HttpError(404, 'Section not found')
  const data = await withNameAndSlug(Section, input, { technologyId: section.technologyId }, { current: section, kind: 'section', parentLabel: 'this technology' })
  return saveChanges(section, data)
}

export async function deleteSection(id) {
  if (await Topic.exists({ sectionId: id })) {
    throw new HttpError(409, 'Delete this section’s topics first')
  }
  const section = await Section.findByIdAndDelete(id)
  if (!section) throw new HttpError(404, 'Section not found')
}

export async function createTopic(sectionId, input) {
  const section = await Section.findById(sectionId).select('_id technologyId name')
  if (!section) throw new HttpError(404, 'Section not found')
  const data = await withNameAndSlug(Topic, input, { sectionId: section._id }, { kind: 'topic', parentLabel: section.name })
  return Topic.create({
    ...data,
    technologyId: section.technologyId,
    sectionId: section._id,
    order: input.order ?? await nextOrder(Topic, { sectionId: section._id }),
  })
}

export async function updateTopic(id, input) {
  const topic = await Topic.findById(id)
  if (!topic) throw new HttpError(404, 'Topic not found')
  const data = await withNameAndSlug(Topic, input, { sectionId: topic.sectionId }, { current: topic, kind: 'topic', parentLabel: 'this section' })
  return saveChanges(topic, data)
}

export async function deleteTopic(id) {
  if (await Question.exists({ topicId: id })) {
    throw new HttpError(409, 'Delete this topic’s questions first')
  }
  const topic = await Topic.findByIdAndDelete(id)
  if (!topic) throw new HttpError(404, 'Topic not found')
}
