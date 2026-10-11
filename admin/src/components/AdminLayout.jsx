import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { CircleAlert, CircleCheck, FolderTree, LayoutDashboard, ListChecks, LogOut, Moon, RefreshCw, Sun, Users, X } from 'lucide-react'
import { apiRequest } from '../api.js'
import { PageLoader } from './ui.jsx'

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/catalog', label: 'Content structure', icon: FolderTree },
  { to: '/questions', label: 'Question library', icon: ListChecks },
  { to: '/admins', label: 'Administrators', icon: Users },
]

function pageTitle(pathname) {
  if (pathname === '/questions/new') return 'New question'
  if (/^\/questions\/[^/]+\/edit$/.test(pathname)) return 'Edit question'
  const item = navigation.find(({ to, end }) => (end ? pathname === to : pathname.startsWith(to)))
  return item?.label ?? 'Not found'
}

// Signed-in shell: sidebar, top bar, toasts, and the content data every page shares.
export function AdminLayout({ admin, theme, toggleTheme, onLogout }) {
  const { pathname } = useLocation()
  const [technologies, setTechnologies] = useState([])
  const [questions, setQuestions] = useState([])
  const [pendingAdminCount, setPendingAdminCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const noticeTimer = useRef(null)

  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type })
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4500)
  }, [])

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [catalogData, questionData, adminData] = await Promise.all([
        apiRequest('/admin/catalog'),
        apiRequest('/admin/questions'),
        apiRequest('/admin/admins'),
      ])
      setTechnologies(catalogData.technologies)
      setQuestions(questionData.questions)
      setPendingAdminCount(adminData.admins.filter((item) => !item.isActive).length)
      setIsLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh().catch((error) => notify(error.message, 'error'))
  }, [refresh, notify])

  async function logout() {
    try {
      await onLogout()
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  const initial = (admin.name || admin.email).slice(0, 1).toUpperCase()
  const workspace = { admin, technologies, questions, isLoaded, refresh, notify, theme, setPendingAdminCount }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">JS</span>
          <span className="brand-copy"><strong>JS MCQ</strong><small>Content studio</small></span>
        </NavLink>
        <p className="sidebar-label">Workspace</p>
        <nav className="side-nav" aria-label="Admin sections">
          {navigation.map(({ to, label, icon: IconComponent, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <IconComponent size={19} />
              {label}
              {to === '/admins' && pendingAdminCount > 0 && (
                <span className="nav-badge" aria-label={`${pendingAdminCount} pending`}>{pendingAdminCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{initial}</span>
          <span className="user-copy"><strong>{admin.name || admin.email}</strong><small>{admin.name ? admin.email : 'Administrator'}</small></span>
          <button className="icon-button sidebar-logout" type="button" onClick={logout} aria-label="Sign out" title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>{pageTitle(pathname)}</strong>
          </div>
          <div className="topbar-actions">
            {loading && <span className="sync-indicator"><RefreshCw size={15} /> Syncing…</span>}
            <button
              className="icon-button icon-button-outline"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="avatar avatar-sm" title={admin.email}>{initial}</span>
          </div>
        </header>

        <main className="content-area">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={workspace} />
          </Suspense>
        </main>
      </div>

      {notice && (
        <div className={`toast ${notice.type === 'error' ? 'toast-error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.type === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
          <span>{notice.message}</span>
          <button className="toast-close" type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16} /></button>
        </div>
      )}
    </div>
  )
}
