import { useState } from 'react'
import { Link } from 'react-router'
import { CircleAlert, MailCheck } from 'lucide-react'
import { apiRequest } from '../api.js'
import { AuthShell } from '../components/AuthShell.jsx'

const minPasswordLength = 12

export function RegisterPage({ theme, toggleTheme }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const passwordsMatch = form.password === form.confirmPassword

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!passwordsMatch) {
      setError('Passwords don’t match.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { name: form.name, email: form.email, password: form.password },
      })
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const backToSignIn = (
    <p className="auth-switch">
      Already approved?{' '}
      <Link className="link-button" to="/login">Sign in</Link>
    </p>
  )

  if (submitted) {
    return (
      <AuthShell
        theme={theme}
        toggleTheme={toggleTheme}
        eyebrow="Request sent"
        title="Waiting for approval"
        description="Your account has been created but is not active yet."
        footer={backToSignIn}
      >
        <div className="alert alert-info" role="status">
          <MailCheck size={18} />
          <span>An existing administrator needs to approve <strong>{form.email}</strong> from the Administrators page. You can sign in once it’s approved.</span>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      theme={theme}
      toggleTheme={toggleTheme}
      eyebrow="Content studio"
      title="Request access"
      description="Create an administrator account. It stays inactive until an existing administrator approves it."
      footer={backToSignIn}
    >
      {error && <div className="alert alert-error" role="alert"><CircleAlert size={18} />{error}</div>}
      <form className="form-stack" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Full name</span>
          <input autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={100} required />
        </label>
        <label className="field">
          <span className="field-label">Email address</span>
          <input autoComplete="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} maxLength={254} required />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            autoComplete="new-password"
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            minLength={minPasswordLength}
            maxLength={200}
            required
          />
          <span className="field-hint">At least {minPasswordLength} characters.</span>
        </label>
        <label className="field">
          <span className="field-label">Confirm password</span>
          <input
            autoComplete="new-password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
            aria-invalid={form.confirmPassword !== '' && !passwordsMatch}
            required
          />
          {form.confirmPassword !== '' && !passwordsMatch && <span className="field-error">Passwords don’t match.</span>}
        </label>
        <button className="button button-primary button-block" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Request access'}
        </button>
      </form>
    </AuthShell>
  )
}
