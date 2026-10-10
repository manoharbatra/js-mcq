const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function getPublicData(path, signal) {
  const response = await fetch(`${apiBase}/public${path}`, { signal })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error ?? `Unable to load content (${response.status})`)
  }

  return data
}

export async function fetchCatalog(signal) {
  const { technologies } = await getPublicData('/technologies', signal)
  return technologies
}

export async function fetchQuestions(technologySlug, sectionSlug, topicSlug, signal) {
  const path = [
    'technologies', technologySlug,
    'sections', sectionSlug,
    'topics', topicSlug,
    'questions',
  ].map(encodeURIComponent).join('/')
  const { questions } = await getPublicData(`/${path}`, signal)
  return questions
}
