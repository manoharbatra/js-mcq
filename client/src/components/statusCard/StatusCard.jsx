import { Link } from '../link'
import './StatusCard.css'

export function StatusCard({ title, message, isLoading = false, isError = false, onRetry, homeLink = false }) {
  return (
    <div className={`card status-card ${isError ? 'is-error' : ''}`} role={isError ? 'alert' : isLoading ? 'status' : undefined}>
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {title && <strong>{title}</strong>}
      {message && <p>{message}</p>}
      {(onRetry || homeLink) && (
        <div className="status-actions">
          {onRetry && <button className="button button-primary button-sm" type="button" onClick={onRetry}>Try again</button>}
          {homeLink && <Link className="button button-secondary button-sm" to="/">Browse study topics</Link>}
        </div>
      )}
    </div>
  )
}
