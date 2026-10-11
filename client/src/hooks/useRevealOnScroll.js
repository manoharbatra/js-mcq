import { useEffect, useRef } from 'react'

// Adds `is-visible` to the element (which should have the `reveal` class) the first time it scrolls into view.
export function useRevealOnScroll() {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return ref
}
