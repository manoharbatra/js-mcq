export function indexCatalog(technologies) {
  const technologyById = new Map()
  const sectionById = new Map()
  const topicById = new Map()
  for (const technology of technologies) {
    technologyById.set(technology._id, technology)
    for (const section of technology.sections) {
      sectionById.set(section._id, section)
      for (const topic of section.topics) topicById.set(topic._id, topic)
    }
  }
  return { technologyById, sectionById, topicById }
}

export function nameOf(map, id) {
  return map.get(id?.toString())?.name ?? '—'
}

// The first topic matching whichever of technology/section/topic are set.
export function firstPlacement(technologies, { technologyId = '', sectionId = '', topicId = '' } = {}) {
  for (const technology of technologies) {
    if (technologyId && technology._id !== technologyId) continue
    for (const section of technology.sections) {
      if (sectionId && section._id !== sectionId) continue
      for (const topic of section.topics) {
        if (topicId && topic._id !== topicId) continue
        return { technologyId: technology._id, sectionId: section._id, topicId: topic._id }
      }
    }
  }
  return { technologyId, sectionId, topicId: '' }
}

export function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
