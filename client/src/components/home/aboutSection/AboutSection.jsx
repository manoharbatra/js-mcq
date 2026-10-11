import { aboutParagraphs, siteOwner } from '../../../data/siteContent.js'
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll.js'
import './AboutSection.css'

export function AboutSection() {
  const revealRef = useRevealOnScroll()

  return (
    <section className="site-section" aria-labelledby="about-title">
      <div className="site-container">
        <div className="about-card reveal" ref={revealRef}>
          <div className="about-copy">
            <h2 id="about-title">About Me</h2>
            <p>
              Hi, I’m <span className="about-highlight">{siteOwner.name}, 11+ years of experience</span>, {aboutParagraphs[0]}
            </p>
            {aboutParagraphs.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          <div className="about-photo">
            <img src={siteOwner.photo} alt={siteOwner.name} loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}
