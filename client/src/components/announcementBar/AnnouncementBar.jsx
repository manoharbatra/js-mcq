import { announcements } from '../../data/siteContent.js'
import './AnnouncementBar.css'

// Continuously scrolling strip of announcements; the list is rendered twice so the loop is seamless.
export function AnnouncementBar() {
  return (
    <div className="announcement-bar" role="region" aria-label="Announcements">
      <ul className="announcement-track">
        {[...announcements, ...announcements].map((message, index) => (
          <li key={index} aria-hidden={index >= announcements.length || undefined}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
