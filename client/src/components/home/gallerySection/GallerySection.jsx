import { useId, useState } from 'react'
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll.js'
import { Carousel } from '../../carousel'
import { Lightbox } from '../../lightbox'
import './GallerySection.css'

// Titled carousel of images. Optional group filter (e.g. organisation) and click-to-enlarge.
export function GallerySection({ title, items, filterLabel, showCaptions = false, zoomable = false, cardWidth = 260, imageFit = 'cover' }) {
  const headingId = useId()
  const revealRef = useRevealOnScroll()
  const [group, setGroup] = useState('All')
  const [openIndex, setOpenIndex] = useState(null)

  const groups = ['All', ...new Set(items.map((item) => item.group).filter(Boolean))]
  const visibleItems = group === 'All' ? items : items.filter((item) => item.group === group)

  return (
    <section className="site-section gallery-section reveal" ref={revealRef} aria-labelledby={headingId}>
      <div className="site-container">
        <div className="gallery-heading">
          <h2 className="site-section-title" id={headingId}>{title}</h2>
          {filterLabel && groups.length > 2 && (
            <select
              className="site-select"
              value={group}
              onChange={(event) => {
                setGroup(event.target.value)
                setOpenIndex(null)
              }}
              aria-label={filterLabel}
            >
              {groups.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          )}
        </div>

        <Carousel label={title}>
          {visibleItems.map((item, index) => {
            const image = <img src={item.image} alt={item.title} loading="lazy" draggable="false" />
            return (
              <li key={item.image} className={`gallery-card fit-${imageFit}`} style={{ width: cardWidth }}>
                {zoomable ? (
                  <button className="gallery-card-media" type="button" onClick={() => setOpenIndex(index)} aria-label={`Enlarge: ${item.title}`}>
                    {image}
                  </button>
                ) : (
                  <div className="gallery-card-media">{image}</div>
                )}
                {showCaptions && <p className="gallery-caption">{item.title}</p>}
              </li>
            )
          })}
        </Carousel>
      </div>

      {openIndex !== null && (
        <Lightbox items={visibleItems} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </section>
  )
}
