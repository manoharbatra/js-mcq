import { useState } from 'react'
import { Link } from 'react-router'
import { CircleAlert, Info } from 'lucide-react'
import { AuthShell } from '../components/AuthShell.jsx'

export function LoginPage({ onLogin, notice, theme, toggleTheme }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onLogin(email, password)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      theme={theme}
      toggleTheme={toggleTheme}
      eyebrow="Content studio"
      title="Welcome back"
      description="Sign in with your administrator account to manage technologies, topics and questions."
      footer={(
        <p className="auth-switch">
          Don’t have an account?{' '}
          <Link className="link-button" to="/register">Request access</Link>
        </p>
      )}
    >
      {notice && !error && <div className="alert alert-info" role="status"><Info size={18} />{notice}</div>}
      {error && <div className="alert alert-error" role="alert"><CircleAlert size={18} />{error}</div>}
      <form className="form-stack" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Email address</span>
          <input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="button button-primary button-block" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  )
}
