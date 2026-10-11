import { communityLinks } from '../../../data/siteContent.js'
import { StatPill } from '../statPill'
import './CommunityStrip.css'

export function CommunityStrip() {
  return (
    <section className="community-strip" aria-label="Community">
      <ul className="site-container">
        {communityLinks.map((link) => (
          <li key={link.href}><StatPill {...link} /></li>
        ))}
      </ul>
    </section>
  )
}
