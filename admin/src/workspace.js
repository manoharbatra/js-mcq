import { useOutletContext } from 'react-router'

// Shared data and actions that AdminLayout passes to every signed-in page:
// { admin, technologies, questions, isLoaded, refresh, notify, theme, setPendingAdminCount }.
export function useWorkspace() {
  return useOutletContext()
}

// Library URL for a placement filter, e.g. /questions?technologyId=…&sectionId=…&topicId=…
export function questionsPath(filter = {}, base = '/questions') {
  const params = new URLSearchParams()
  for (const key of ['technologyId', 'sectionId', 'topicId']) {
    if (filter[key]) params.set(key, filter[key])
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}
