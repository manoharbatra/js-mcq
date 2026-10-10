import { useState } from 'react'
import { CircleAlert, Moon, ShieldCheck, Sun } from 'lucide-react'

export function LoginPage({ onLogin, theme, toggleTheme }) {
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
    <main className="login-shell">
      <button
        className="icon-button login-theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <section className="login-card">
        <span className="brand-mark brand-mark-lg">JS</span>
        <p className="eyebrow">Content studio</p>
        <h1>Welcome back</h1>
        <p className="login-copy">Sign in with your administrator account to manage technologies, topics and questions.</p>
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
        <p className="login-footnote"><ShieldCheck size={16} /> Protected administrator access</p>
      </section>
    </main>
  )
}
