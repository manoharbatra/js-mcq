import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import { StatusCard } from './StatusCard.jsx'
import { TopicBadge } from './TopicBadge.jsx'

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
                <TopicBadge name={card.badgeName} icon={card.icon} size="lg" />
                <div>
                  <h2 id={`card-${card.id}`}>{card.name}</h2>
                  <span className="topic-card-count">{card.meta}</span>
                </div>
              </header>
              {card.links.length ? (
                <ul className="subtopic-links">
                  {card.links.map((link) => (
                    <li key={link.id}>
                      <Link to={link.to}>
                        <span className="subtopic-link-text">
                          <strong>{link.name}</strong>
                          {link.meta && <small>{link.meta}</small>}
                        </span>
                        <Icon name="chevronRight" size={16} />
                      </Link>
                    </li>
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
