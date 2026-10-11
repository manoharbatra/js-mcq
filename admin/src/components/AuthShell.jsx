import { Moon, ShieldCheck, Sun } from 'lucide-react'

// Shared frame for the signed-out screens (sign in, register).
export function AuthShell({ theme, toggleTheme, eyebrow, title, description, children, footer }) {
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
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="login-copy">{description}</p>
        {children}
        {footer}
        <p className="login-footnote"><ShieldCheck size={16} /> Protected administrator access</p>
      </section>
    </main>
  )
}
