import { useCallback, useEffect, useState } from 'react'
import { Check, Clock, ShieldCheck, ShieldOff, Trash2, UserCheck, Users } from 'lucide-react'
import { apiRequest } from '../api.js'
import { useConfirm } from '../components/ConfirmProvider.jsx'
import { EmptyState, PageHeader, Pill } from '../components/ui.jsx'
import { useWorkspace } from '../workspace.js'

function displayName(admin) {
  return admin.name || admin.email
}

export function AdminsPage() {
  const { admin: currentAdmin, notify, setPendingAdminCount: onPendingCountChange } = useWorkspace()
  const confirm = useConfirm()
  const [admins, setAdmins] = useState([])
  const [status, setStatus] = useState('loading')
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async () => {
    const { admins: loaded } = await apiRequest('/admin/admins')
    setAdmins(loaded)
    setStatus('ready')
    onPendingCountChange?.(loaded.filter((admin) => !admin.isActive).length)
  }, [onPendingCountChange])

  useEffect(() => {
    load().catch((error) => {
      setStatus('error')
      notify(error.message, 'error')
    })
  }, [load, notify])

  async function setActive(admin, isActive) {
    if (!isActive) {
      const confirmed = await confirm({
        title: `Deactivate ${displayName(admin)}?`,
        message: `${admin.email} will be signed out and won’t be able to sign in until reactivated.`,
        confirmLabel: 'Deactivate',
      })
      if (!confirmed) return
    }
    setBusyId(admin.id)
    try {
      await apiRequest(`/admin/admins/${admin.id}`, { method: 'PATCH', body: { isActive } })
      await load()
      notify(isActive ? `${displayName(admin)} can now sign in.` : `${displayName(admin)} was deactivated.`)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBusyId('')
    }
  }

  async function remove(admin, { isRequest = false } = {}) {
    const confirmed = await confirm({
      title: isRequest ? `Reject the request from ${displayName(admin)}?` : `Delete ${displayName(admin)}?`,
      message: isRequest
        ? `The pending account for ${admin.email} will be removed. They can register again later.`
        : `The account for ${admin.email} will be permanently removed. This can’t be undone.`,
      confirmLabel: isRequest ? 'Reject request' : 'Delete account',
    })
    if (!confirmed) return
    setBusyId(admin.id)
    try {
      await apiRequest(`/admin/admins/${admin.id}`, { method: 'DELETE' })
      await load()
      notify(isRequest ? 'Request rejected.' : 'Account deleted.')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBusyId('')
    }
  }

  const pending = admins.filter((admin) => !admin.isActive)
  const active = admins.filter((admin) => admin.isActive)

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Administrators"
        description="Approve new registrations and manage who can sign in to the content studio."
      />

      <section className="panel admin-section">
        <div className="panel-header">
          <div>
            <h2>Pending and inactive <span className="count-badge">{pending.length}</span></h2>
            <p>Registered accounts can’t sign in until you approve them.</p>
          </div>
        </div>
        {status === 'loading' ? (
          <p className="panel-message">Loading administrators…</p>
        ) : pending.length ? (
          <ul className="admin-list">
            {pending.map((admin) => (
              <li key={admin.id} className="admin-row">
                <span className="avatar avatar-muted">{displayName(admin).slice(0, 1).toUpperCase()}</span>
                <span className="admin-copy">
                  <strong>{displayName(admin)}</strong>
                  <span>{admin.email} · requested {new Date(admin.createdAt).toLocaleDateString()}</span>
                </span>
                <Pill tone="muted" icon={Clock}>Awaiting approval</Pill>
                <span className="admin-actions">
                  <button className="button button-primary button-sm" type="button" disabled={busyId === admin.id} onClick={() => setActive(admin, true)}>
                    <Check size={16} /> Approve
                  </button>
                  <button className="icon-button icon-button-danger" type="button" disabled={busyId === admin.id} onClick={() => remove(admin, { isRequest: true })} aria-label={`Reject ${admin.email}`} title="Reject request">
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={UserCheck} title="No pending requests" detail="New registrations will appear here for approval." />
        )}
      </section>

      <section className="panel admin-section">
        <div className="panel-header">
          <div>
            <h2>Active administrators <span className="count-badge">{active.length}</span></h2>
            <p>Everyone listed here can manage content.</p>
          </div>
        </div>
        {status === 'loading' ? (
          <p className="panel-message">Loading administrators…</p>
        ) : active.length ? (
          <ul className="admin-list">
            {active.map((admin) => {
              const isSelf = admin.id === currentAdmin.id
              return (
                <li key={admin.id} className="admin-row">
                  <span className="avatar">{displayName(admin).slice(0, 1).toUpperCase()}</span>
                  <span className="admin-copy">
                    <strong>{displayName(admin)}{isSelf && <span className="you-tag">You</span>}</strong>
                    <span>{admin.email}</span>
                  </span>
                  <Pill tone="success" icon={ShieldCheck}>Active</Pill>
                  <span className="admin-actions">
                    {!isSelf && (
                      <>
                        <button className="button button-secondary button-sm" type="button" disabled={busyId === admin.id} onClick={() => setActive(admin, false)}>
                          <ShieldOff size={16} /> Deactivate
                        </button>
                        <button className="icon-button icon-button-danger" type="button" disabled={busyId === admin.id} onClick={() => remove(admin)} aria-label={`Delete ${admin.email}`} title="Delete account">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState icon={Users} title="No active administrators" />
        )}
      </section>
    </>
  )
}
