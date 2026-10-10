import { Crown } from 'lucide-react'
import './MembershipBanner.css'

// Shared prompt for locked content; the button goes to the membership URL set on the section.
export function MembershipBanner({ url }) {
  return (
    <section className="card membership-banner">
      <span className="membership-icon"><Crown size={22} /></span>
      <div>
        <h2>Buy membership to see premium content</h2>
        <p>Get access to solutions, interview questions, detailed explanations and more.</p>
      </div>
      {url ? (
        <a className="button button-primary" href={url} target="_blank" rel="noopener noreferrer">Buy Membership</a>
      ) : (
        <button className="button button-primary" type="button" disabled>Buy Membership</button>
      )}
    </section>
  )
}
