import { Question } from '../models/Question.js'
import { Subtopic } from '../models/Subtopic.js'
import { Topic } from '../models/Topic.js'
import { HttpError } from '../utils/errors.js'

export async function listTopicsForAdmin() {
  const [topics, subtopics] = await Promise.all([
    Topic.find().sort({ order: 1, name: 1 }).lean(),
    Subtopic.find().sort({ order: 1, name: 1 }).lean(),
  ])
  const groupedSubtopics = new Map()
  for (const subtopic of subtopics) {
    const topicId = subtopic.topic.toString()
    const items = groupedSubtopics.get(topicId) ?? []
    items.push(subtopic)
    groupedSubtopics.set(topicId, items)
  }

  return topics.map((topic) => ({
    ...topic,
    subtopics: groupedSubtopics.get(topic._id.toString()) ?? [],
  }))
}

export async function createTopic(input) {
  return Topic.create(input)
}

export async function updateTopic(id, input) {
  const topic = await Topic.findByIdAndUpdate(id, input, { new: true, runValidators: true })
  if (!topic) throw new HttpError(404, 'Topic not found')
  return topic
}

export async function deleteTopic(id) {
  const [subtopicCount, questionCount] = await Promise.all([
    Subtopic.countDocuments({ topic: id }),
    Question.countDocuments({ topic: id }),
  ])
  if (subtopicCount || questionCount) {
    throw new HttpError(409, 'Delete this topic’s subtopics and questions first')
  }
  const topic = await Topic.findByIdAndDelete(id)
  if (!topic) throw new HttpError(404, 'Topic not found')
}

export async function createSubtopic(topicId, input) {
  const topic = await Topic.findById(topicId)
  if (!topic) throw new HttpError(404, 'Topic not found')
  return Subtopic.create({ ...input, topic: topic._id })
}

export async function updateSubtopic(id, input) {
  const subtopic = await Subtopic.findByIdAndUpdate(id, input, { new: true, runValidators: true })
  if (!subtopic) throw new HttpError(404, 'Subtopic not found')
  return subtopic
}

export async function deleteSubtopic(id) {
  if (await Question.exists({ subtopic: id })) {
    throw new HttpError(409, 'Delete this subtopic’s questions first')
  }
  const subtopic = await Subtopic.findByIdAndDelete(id)
  if (!subtopic) throw new HttpError(404, 'Subtopic not found')
}

export async function listPublishedTopics() {
  const topics = await Topic.find({ isPublished: true }).sort({ order: 1, name: 1 }).lean()
  const topicIds = topics.map(({ _id }) => _id)
  const subtopics = await Subtopic.find({ topic: { $in: topicIds }, isPublished: true })
    .sort({ order: 1, name: 1 })
    .lean()
  const groupedSubtopics = new Map()
  for (const subtopic of subtopics) {
    const topicId = subtopic.topic.toString()
    const items = groupedSubtopics.get(topicId) ?? []
    items.push({
      id: subtopic._id,
      name: subtopic.name,
      slug: subtopic.slug,
      description: subtopic.description,
      order: subtopic.order,
    })
    groupedSubtopics.set(topicId, items)
  }

  return topics.map((topic) => ({
    id: topic._id,
    name: topic.name,
    slug: topic.slug,
    description: topic.description,
    subtopics: groupedSubtopics.get(topic._id.toString()) ?? [],
  }))
}
