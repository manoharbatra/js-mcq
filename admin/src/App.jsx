import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router'
import { apiRequest } from './api.js'
import { useTheme } from './useTheme.js'
import { AdminLayout } from './components/AdminLayout.jsx'
import { PageLoader } from './components/ui.jsx'

// Every page is its own chunk, fetched the first time its route is visited.
const page = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })))
const LoginPage = page(() => import('./pages/LoginPage.jsx'), 'LoginPage')
const RegisterPage = page(() => import('./pages/RegisterPage.jsx'), 'RegisterPage')
const OverviewPage = page(() => import('./pages/OverviewPage.jsx'), 'OverviewPage')
const CatalogPage = page(() => import('./pages/CatalogPage.jsx'), 'CatalogPage')
const QuestionsPage = page(() => import('./pages/QuestionsPage.jsx'), 'QuestionsPage')
const QuestionEditorPage = page(() => import('./pages/QuestionEditorPage.jsx'), 'QuestionEditorPage')
const AdminsPage = page(() => import('./pages/AdminsPage.jsx'), 'AdminsPage')
const NotFoundPage = page(() => import('./pages/NotFoundPage.jsx'), 'NotFoundPage')

function RequireAuth({ admin }) {
  const location = useLocation()
  if (!admin) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Once signed in, leave /login or /register for the page that originally redirected here (or /).
function GuestOnly({ admin }) {
  const from = useLocation().state?.from
  if (admin) return <Navigate to={from ? `${from.pathname}${from.search ?? ''}` : '/'} replace />
  return (
    <Suspense fallback={<PageLoader fullScreen />}>
      <Outlet />
    </Suspense>
  )
}

function App() {
  const [theme, toggleTheme] = useTheme()
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [sessionMessage, setSessionMessage] = useState('')

  useEffect(() => {
    let mounted = true
    apiRequest('/auth/me')
      .then((data) => { if (mounted) setAdmin(data.admin) })
      .catch(() => { /* Not signed in: the routes send the visitor to /login. */ })
      .finally(() => { if (mounted) setCheckingSession(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    function expireSession() {
      setAdmin(null)
      setSessionMessage('Your session expired. Please sign in again.')
    }
    window.addEventListener('admin-session-expired', expireSession)
    return () => window.removeEventListener('admin-session-expired', expireSession)
  }, [])

  // GuestOnly redirects away from /login as soon as `admin` is set.
  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
    setSessionMessage('')
    setAdmin(data.admin)
  }, [])

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' })
    setAdmin(null)
    navigate('/login', { replace: true })
  }, [navigate])

  if (checkingSession) return <PageLoader fullScreen label="Opening your workspace…" />

  const themeProps = { theme, toggleTheme }

  return (
    <Routes>
      <Route element={<GuestOnly admin={admin} />}>
        <Route path="/login" element={<LoginPage onLogin={login} notice={sessionMessage} {...themeProps} />} />
        <Route path="/register" element={<RegisterPage {...themeProps} />} />
      </Route>
      <Route element={<RequireAuth admin={admin} />}>
        <Route element={<AdminLayout admin={admin} onLogout={logout} {...themeProps} />}>
          <Route index element={<OverviewPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="questions/new" element={<QuestionEditorPage />} />
          <Route path="questions/:questionId/edit" element={<QuestionEditorPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
