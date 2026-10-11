import { useState } from 'react'
import { ChevronDown, Play } from 'lucide-react'
import { podcastSections } from '../data/podcasts.js'
import '../site.css'
import './PodcastsPage.css'

const allCategories = 'All'

function thumbnailUrl(videoId, quality) {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

function EpisodeCard({ episode, number, sectionTitle }) {
  const [quality, setQuality] = useState('maxresdefault')
  const label = episode.title || `${sectionTitle} — episode ${number}`
  const href = episode.link || `https://www.youtube.com/watch?v=${episode.youtubeId}`

  return (
    <li>
      {episode.title && <p className="episode-title">{episode.title}</p>}
      <a className="episode-card" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${label} on YouTube (opens in a new tab)`}>
        <img
          src={thumbnailUrl(episode.youtubeId, quality)}
          alt=""
          loading="lazy"
          // Videos without a max-resolution thumbnail get YouTube's 120×90 grey placeholder (or an error);
          // either way, fall back to the high-quality thumbnail, which always exists.
          onLoad={(event) => {
            if (quality === 'maxresdefault' && event.currentTarget.naturalWidth <= 120) setQuality('hqdefault')
          }}
          onError={() => setQuality((current) => (current === 'maxresdefault' ? 'hqdefault' : current))}
        />
        <span className="episode-play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>
      </a>
    </li>
  )
}

export function PodcastsPage() {
  const [category, setCategory] = useState(allCategories)
  const [openSections, setOpenSections] = useState(() => new Set(podcastSections.map((section) => section.title)))

  const visibleSections = category === allCategories
    ? podcastSections
    : podcastSections.filter((section) => section.title === category)
  const allOpen = visibleSections.every((section) => openSections.has(section.title))

  function chooseCategory(next) {
    setCategory(next)
    // Choosing one category opens just that section; "All" reopens everything.
    setOpenSections(new Set(next === allCategories ? podcastSections.map((section) => section.title) : [next]))
  }

  function toggleSection(title) {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div className="site podcasts-page">
      <div className="site-container podcasts-container">
        <h1 className="site-page-title">Podcasts</h1>
        <p className="podcasts-intro">Real conversations with people working across the industry, grouped by career track.</p>

        <div className="podcast-filters" role="group" aria-label="Filter by category">
          {[allCategories, ...podcastSections.map((section) => section.title)].map((name) => (
            <button
              key={name}
              type="button"
              className={`podcast-filter ${category === name ? 'active' : ''}`}
              aria-pressed={category === name}
              onClick={() => chooseCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="podcast-toolbar">
          <button
            className="site-button podcast-toggle-all"
            type="button"
            onClick={() => setOpenSections(new Set(allOpen ? [] : visibleSections.map((section) => section.title)))}
          >
            {allOpen ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="podcast-sections">
          {visibleSections.map((section, sectionIndex) => {
            const isOpen = openSections.has(section.title)
            const panelId = `podcast-panel-${sectionIndex}`
            return (
              <section className={`podcast-section ${isOpen ? 'is-open' : ''}`} key={section.title}>
                <h2>
                  <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggleSection(section.title)}>
                    <span>{section.title} <span className="podcast-count">({section.episodes.length})</span></span>
                    <ChevronDown size={20} className="podcast-chevron" aria-hidden="true" />
                  </button>
                </h2>
                <div className="podcast-panel" id={panelId} hidden={!isOpen}>
                  <ul className="episode-grid">
                    {section.episodes.map((episode, index) => (
                      <EpisodeCard key={episode.youtubeId} episode={episode} number={index + 1} sectionTitle={section.title} />
                    ))}
                  </ul>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
