import { useEffect, useId, useRef } from 'react'
import { Inbox, X } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

export function EmptyState({ icon: IconComponent = Inbox, title, detail, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><IconComponent size={22} /></span>
      <strong>{title}</strong>
      {detail && <p>{detail}</p>}
      {action}
    </div>
  )
}

export function Pill({ tone = 'neutral', icon: IconComponent, children }) {
  return (
    <span className={`pill pill-${tone}`}>
      {IconComponent && <IconComponent size={13} />}
      {children}
    </span>
  )
}

// A native <dialog> shown modally while mounted; Escape and backdrop clicks call onClose.
export function Modal({ title, description, onClose, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="modal-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export function Switch({ checked, onChange, label, description }) {
  return (
    <label className="switch-field">
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
      <span className="switch-copy">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
    </label>
  )
}
