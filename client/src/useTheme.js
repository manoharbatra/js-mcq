import { useEffect, useState } from 'react'

const storageKey = 'js-mcq-client-theme'

// index.html applies the stored (or system) theme before first paint; start from that value.
function getInitialTheme() {
  const theme = document.documentElement.dataset.theme
  if (theme === 'dark' || theme === 'light') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    try {
      localStorage.setItem(storageKey, nextTheme)
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  return [theme, toggleTheme]
}
