import { useCatalog } from '../catalogContext.js'
import { TopicPage } from '../components/topicPage'

export function TopicRoute() {
  const { technology, section, topic } = useCatalog()
  // Keyed per topic so question state starts fresh when moving between topics.
  return <TopicPage key={topic.id} technology={technology} section={section} topic={topic} />
}
