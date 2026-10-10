import { SquareArrowOutUpRight } from 'lucide-react'
import { buildPath } from '../router.js'
import { Link } from './Link.jsx'
import { StatusCard } from './StatusCard.jsx'

// Numbered index of a section's topics; a Medium link is shown only for topics that have one.
export function SectionPage({ technology, section }) {
  return (
    <div className="section-page">
      <header className="page-header">
        <h1>{technology.name} {section.name}</h1>
        <p>Learn and revise {technology.name} {section.name.toLowerCase()} with curated resources.</p>
      </header>

      {section.topics.length ? (
        <ol className="card topic-index">
          {section.topics.map((topic, index) => {
            const hasArticle = Boolean(topic.mediumUrl)
            return (
              <li className={`topic-index-row ${hasArticle ? 'has-article' : ''}`} key={topic.id}>
                <span className="topic-index-number" aria-hidden="true">{index + 1}</span>
                <div className="topic-index-body">
                  <Link className="topic-index-name" to={buildPath(technology.slug, section.slug, topic.slug)}>
                    {topic.name}
                  </Link>
                  {hasArticle && (
                    <a
                      className="topic-index-resource"
                      href={topic.mediumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Medium article for ${topic.name} (opens in a new tab)`}
                    >
                      <SquareArrowOutUpRight size={18} />
                      Medium Link
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <StatusCard title="No topics in this section yet" message="Topics will appear here once they’re added." homeLink />
      )}
    </div>
  )
}
