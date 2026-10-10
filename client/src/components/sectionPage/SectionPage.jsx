import { Lock, SquareArrowOutUpRight } from 'lucide-react'
import { buildPath } from '../../router.js'
import { Link } from '../link'
import { MembershipBanner } from '../membershipBanner'
import { StatusCard } from '../statusCard'
import './SectionPage.css'

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
            const isLocked = topic.isPaid === true
            const hasArticle = Boolean(topic.mediumUrl)
            return (
              <li className={`topic-index-row ${hasArticle ? 'has-article' : ''}`} key={topic.id}>
                <span className="topic-index-number" aria-hidden="true">{index + 1}</span>
                <div className="topic-index-body">
                  {isLocked ? (
                    <span className="topic-index-name is-disabled" aria-disabled="true">{topic.name}</span>
                  ) : (
                    <Link className="topic-index-name" to={buildPath(technology.slug, section.slug, topic.slug)}>
                      {topic.name}
                    </Link>
                  )}
                  {isLocked && (
                    <span className="topic-index-resource is-disabled" aria-disabled="true">
                      <Lock size={18} />
                      Premium content
                    </span>
                  )}
                  {!isLocked && hasArticle && (
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

      {section.topics.some((topic) => topic.isPaid === true || topic.hasPaidQuestions) && (
        <MembershipBanner url={section.membershipUrl} />
      )}
    </div>
  )
}
