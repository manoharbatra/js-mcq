import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import './Lightbox.css'

// Full-size image viewer. `items` are { image, title, subtitle?, logo? }; arrow keys move between them.
export function Lightbox({ items, index, onIndexChange, onClose }) {
  const dialogRef = useRef(null)
  const item = items[index]
  const hasMany = items.length > 1

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  function step(offset) {
    onIndexChange((index + offset + items.length) % items.length)
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowRight' && hasMany) step(1)
    if (event.key === 'ArrowLeft' && hasMany) step(-1)
  }

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={item.title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      onKeyDown={onKeyDown}
    >
      <div className="lightbox-frame">
        <img className="lightbox-image" src={item.image} alt={item.title} />
        <div className="lightbox-info">
          {item.logo && <img className="lightbox-logo" src={item.logo} alt="" />}
          <div>
            <h2>{item.title}</h2>
            {item.subtitle && <p>{item.subtitle}</p>}
          </div>
          {hasMany && <span className="lightbox-count">{index + 1} / {items.length}</span>}
        </div>

        <button className="lightbox-button lightbox-close" type="button" onClick={onClose} aria-label="Close" autoFocus>
          <X size={22} />
        </button>
        {hasMany && (
          <>
            <button className="lightbox-button lightbox-prev" type="button" onClick={() => step(-1)} aria-label="Previous image">
              <ChevronLeft size={26} />
            </button>
            <button className="lightbox-button lightbox-next" type="button" onClick={() => step(1)} aria-label="Next image">
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>
    </dialog>
  )
}
