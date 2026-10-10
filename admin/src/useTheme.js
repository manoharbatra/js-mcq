import { useEffect, useState } from 'react'

const storageKey = 'js-mcq-admin-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(storageKey, theme)
  }, [theme])

  return [theme, () => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')]
}
