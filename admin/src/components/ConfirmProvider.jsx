import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { Info, TriangleAlert } from 'lucide-react'

const ConfirmContext = createContext(null)

function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', blocked = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const messageId = useId()
  const ToneIcon = blocked ? Info : TriangleAlert

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
      className="modal confirm-dialog"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel()
      }}
    >
      <div className="confirm-body">
        <span className={`confirm-icon confirm-icon-${blocked ? 'info' : tone}`}><ToneIcon size={22} /></span>
        <div>
          <h2 id={titleId}>{title}</h2>
          {message && <p id={messageId}>{message}</p>}
        </div>
      </div>
      <div className="confirm-footer">
        {blocked ? (
          <button className="button button-primary" type="button" onClick={onCancel} autoFocus>Got it</button>
        ) : (
          <>
            <button className="button button-secondary" type="button" onClick={onCancel} autoFocus>{cancelLabel}</button>
            <button className={`button ${tone === 'danger' ? 'button-danger' : 'button-primary'}`} type="button" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </>
        )}
      </div>
    </dialog>
  )
}

// Wrap the app once; any component can then `await confirm({ title, message })` to get true/false.
// Options: title, message, confirmLabel, cancelLabel, tone ('danger' | 'primary'), blocked (single "Got it" button).
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const resolveRef = useRef(null)

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolveRef.current?.(false)
    resolveRef.current = resolve
    setRequest(options)
  }), [])

  function close(result) {
    resolveRef.current?.(result)
    resolveRef.current = null
    setRequest(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <ConfirmDialog
          {...request}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return confirm
}
