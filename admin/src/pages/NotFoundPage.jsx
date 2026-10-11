import { Link } from 'react-router'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/ui.jsx'

export function NotFoundPage() {
  return (
    <section className="panel">
      <EmptyState
        icon={Compass}
        title="Page not found"
        detail="This address doesn’t match any page in the content studio."
        action={<Link className="button button-secondary" to="/">Go to overview</Link>}
      />
    </section>
  )
}
