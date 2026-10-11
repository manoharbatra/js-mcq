import { useCatalog } from '../catalogContext.js'
import { Overview } from '../components/overview'
import { countLabel } from '../format.js'
import { buildPath } from '../paths.js'

export function TechnologyPage() {
  const { technology } = useCatalog()
  return (
    <Overview
      title={technology.name}
      description={`Pick a ${technology.name} topic to start practicing.`}
      emptyTitle="No sections yet"
      emptyMessage="Sections for this technology will appear here once they're created."
      cards={technology.sections.map((section) => ({
        id: section.id,
        name: section.name,
        badgeName: section.name,
        meta: `${countLabel(section.topics.length, 'topic')} · ${countLabel(section.questionCount, 'question')}`,
        emptyNote: 'No topics yet.',
        links: section.topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          meta: countLabel(topic.questionCount, 'question'),
          to: topic.questionCount === 0 ? null : buildPath(technology.slug, section.slug, topic.slug),
        })),
      }))}
    />
  )
}
