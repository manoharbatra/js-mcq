import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, FolderTree, LayoutDashboard, ListChecks, LogOut, Moon, RefreshCw, Sun, X } from 'lucide-react'
import { apiRequest } from './api.js'
import { useTheme } from './useTheme.js'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { QuestionsPage } from './pages/QuestionsPage.jsx'

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'catalog', label: 'Content structure', icon: FolderTree },
  { id: 'questions', label: 'Question library', icon: ListChecks },
]

function App() {
  const [theme, toggleTheme] = useTheme()
  const [admin, setAdmin] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [activePage, setActivePage] = useState('overview')
  const [libraryOptions, setLibraryOptions] = useState({ key: 0, filter: null, create: false })
  const [technologies, setTechnologies] = useState([])
  const [questions, setQuestions] = useState([])
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
      const [catalogData, questionData] = await Promise.all([
        apiRequest('/admin/catalog'),
        apiRequest('/admin/questions'),
      ])
      setTechnologies(catalogData.technologies)
      setQuestions(questionData.questions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    apiRequest('/auth/me')
      .then((data) => { if (mounted) setAdmin(data.admin) })
      .catch((error) => { if (error.message !== 'Authentication required' && error.message !== 'Invalid or expired session') notify(error.message, 'error') })
      .finally(() => { if (mounted) setCheckingSession(false) })
    return () => { mounted = false }
  }, [notify])

  useEffect(() => {
    function expireSession() {
      setAdmin(null)
      notify('Your session expired. Please sign in again.', 'error')
    }
    window.addEventListener('admin-session-expired', expireSession)
    return () => window.removeEventListener('admin-session-expired', expireSession)
  }, [notify])

  useEffect(() => {
    if (admin) refresh().catch((error) => notify(error.message, 'error'))
  }, [admin, refresh, notify])

  async function login(email, password) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
    setAdmin(data.admin)
    setActivePage('overview')
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      setAdmin(null)
      setTechnologies([])
      setQuestions([])
      setActivePage('overview')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  // Opening the library always remounts it so filters and "create" start from the options given.
  function navigate(page, { create = false, filter = null } = {}) {
    if (page === 'questions') setLibraryOptions((current) => ({ key: current.key + 1, filter, create }))
    setActivePage(page)
  }

  if (checkingSession) {
    return <main className="boot-screen"><span className="brand-mark brand-mark-lg">JS</span><span>Opening your workspace…</span></main>
  }
  if (!admin) return <LoginPage onLogin={login} theme={theme} toggleTheme={toggleTheme} />

  const activeItem = navigation.find((item) => item.id === activePage)
  const initial = admin.email.slice(0, 1).toUpperCase()

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); navigate('overview') }}>
          <span className="brand-mark">JS</span>
          <span className="brand-copy"><strong>JS MCQ</strong><small>Content studio</small></span>
        </a>
        <p className="sidebar-label">Workspace</p>
        <nav className="side-nav" aria-label="Admin sections">
          {navigation.map(({ id, label, icon: IconComponent }) => (
            <button
              key={id}
              className={`nav-item ${activePage === id ? 'active' : ''}`}
              type="button"
              aria-current={activePage === id ? 'page' : undefined}
              onClick={() => navigate(id)}
            >
              <IconComponent size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{initial}</span>
          <span className="user-copy"><strong>{admin.email}</strong><small>Administrator</small></span>
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
            <strong>{activeItem?.label}</strong>
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
          {activePage === 'overview' && <OverviewPage technologies={technologies} questions={questions} onNavigate={navigate} />}
          {activePage === 'catalog' && (
            <CatalogPage
              technologies={technologies}
              refresh={refresh}
              notify={notify}
              onOpenQuestions={(filter) => navigate('questions', { filter })}
            />
          )}
          {activePage === 'questions' && (
            <QuestionsPage
              key={libraryOptions.key}
              technologies={technologies}
              questions={questions}
              refresh={refresh}
              notify={notify}
              theme={theme}
              initialFilter={libraryOptions.filter}
              createOnLoad={libraryOptions.create}
            />
          )}
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

export default App
