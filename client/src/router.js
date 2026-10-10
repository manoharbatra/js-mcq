import { useSyncExternalStore } from 'react'

const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

function getPathname() {
  return window.location.pathname
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname)
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment).toLowerCase()
  } catch {
    return segment.toLowerCase()
  }
}

// Routes: `/`, `/:technologySlug`, `/:technologySlug/:sectionSlug` and `/:technologySlug/:sectionSlug/:topicSlug`.
export function parseRoute(pathname) {
  const [technologySlug = '', sectionSlug = '', topicSlug = ''] = pathname.split('/').filter(Boolean).map(decodeSegment)
  return { technologySlug, sectionSlug, topicSlug }
}

export function buildPath(...slugs) {
  return `/${slugs.filter(Boolean).map(encodeURIComponent).join('/')}`
}

export function navigate(path, { replace = false } = {}) {
  if (path === window.location.pathname) return
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path)
  for (const listener of listeners) listener()
}
