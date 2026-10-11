import { useEffect, useState } from 'react'
import { heroActions, heroBadges, heroSlides, siteOwner } from '../../../data/siteContent.js'
import { StatPill } from '../statPill'
import './HeroSection.css'

const rotationMs = 4000

export function HeroSection() {
  const [slideIndex, setSlideIndex] = useState(0)
  const slide = heroSlides[slideIndex]

  useEffect(() => {
    const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % heroSlides.length), rotationMs)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner site-container">
        <div className="hero-copy">
          <h1 id="hero-title">{siteOwner.tagline}</h1>
          {/* Keyed so each new slide replays the fade-in. */}
          <div className="hero-rotator" aria-live="polite" key={slideIndex}>
            <p className="hero-headline">{slide.headline}</p>
            <p className="hero-detail">{slide.detail}</p>
          </div>
          <div className="hero-actions">
            {heroActions.map((action) => <StatPill key={action.value} {...action} />)}
          </div>
        </div>

        <figure className="hero-portrait">
          <img src={siteOwner.photo} alt={siteOwner.name} width="288" height="360" fetchPriority="high" />
          <figcaption className="hero-badge hero-badge-role">{heroBadges.role}</figcaption>
          <span className="hero-badge hero-badge-experience">{heroBadges.experience}</span>
          <span className="hero-badge hero-badge-companies" aria-label={`Worked at ${heroBadges.companies.map((company) => company.name).join(', ')}`}>
            {heroBadges.companies.map((company) => (
              <img key={company.name} src={company.logo} alt="" height="28" />
            ))}
          </span>
        </figure>
      </div>
    </section>
  )
}
