import { Link } from 'react-router'
import './StatPill.css'

// Rounded chip with an icon (or small image), a bold value and a caption. `to` links in-app; `href` opens a new tab.
export function StatPill({ to, href, icon: IconComponent, image, value, label, tone = 'neutral', highlight = false }) {
  const content = (
    <>
      <span className={`stat-pill-icon tone-${tone}`} aria-hidden="true">
        {IconComponent ? <IconComponent /> : image ? <img src={image} alt="" width="26" height="26" /> : null}
      </span>
      <span className="stat-pill-text">
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </>
  )
  const className = `stat-pill ${highlight ? 'is-highlight' : ''}`

  if (to) return <Link className={className} to={to}>{content}</Link>
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{content}</a>
}
