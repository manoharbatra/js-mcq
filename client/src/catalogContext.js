import { useOutletContext } from 'react-router'

// What AppLayout passes to every page: the loaded catalog plus the records the URL resolved to.
// { technologies, technology, section, topic } — technology/section/topic are null when absent from the URL.
export function useCatalog() {
  return useOutletContext()
}
