import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { StatusCard } from '../statusCard'
import { TopicBadge } from '../topicBadge'
import './Overview.css'

// A grid of cards, each listing links one level down (home: technologies › sections, technology: sections › topics).
export function Overview({ title, description, cards, emptyTitle, emptyMessage }) {
  return (
    <div className="overview">
      <header className="page-header">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>
      {cards.length ? (
        <div className="topic-grid">
          {cards.map((card) => (
            <section className="card topic-card" key={card.id} aria-labelledby={`card-${card.id}`}>
              <header className="topic-card-header">
                <TopicBadge name={card.badgeName} size="lg" />
                <div>
                  <h2 id={`card-${card.id}`}>{card.name}</h2>
                  <span className="topic-card-count">{card.meta}</span>
                </div>
              </header>
              {card.links.length ? (
                <ul className="subtopic-links">
                  {card.links.map((link) => {
                    const content = (
                      <>
                        <span className="subtopic-link-text">
                          <strong>{link.name}</strong>
                          {link.meta && <small>{link.meta}</small>}
                        </span>
                        {link.to && <ChevronRight size={16} />}
                      </>
                    )
                    // A link without a destination (e.g. a topic with no questions) is shown but not clickable.
                    return (
                      <li key={link.id}>
                        {link.to
                          ? <Link to={link.to}>{content}</Link>
                          : <span className="subtopic-link is-disabled" aria-disabled="true">{content}</span>}
                      </li>
                    )
                  })}
                  ))}
                </ul>
              ) : <p className="empty-note">{card.emptyNote}</p>}
            </section>
          ))}
        </div>
      ) : (
        <StatusCard title={emptyTitle} message={emptyMessage} />
      )}
    </div>
  )
}
