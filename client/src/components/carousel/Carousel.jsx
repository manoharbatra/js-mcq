import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Carousel.css'

// Horizontal scroller with arrow buttons and mouse drag; touch devices use native swipe.
export function Carousel({ label, children }) {
  const trackRef = useRef(null)
  const dragRef = useRef(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })

  const updateEdges = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setEdges({
      atStart: track.scrollLeft <= 4,
      atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    })
  }, [])

  // Re-check the arrows whenever the track resizes or its items change (e.g. after filtering).
  useEffect(() => {
    const track = trackRef.current
    const observer = new ResizeObserver(updateEdges)
    observer.observe(track)
    for (const item of track.children) observer.observe(item)
    return () => observer.disconnect()
  }, [updateEdges, children])

  function scrollByPage(direction) {
    const track = trackRef.current
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.8, 260), behavior: 'smooth' })
  }

  function onPointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragRef.current = { startX: event.clientX, scrollLeft: trackRef.current.scrollLeft, moved: false }
  }

  function onPointerMove(event) {
    const drag = dragRef.current
    if (!drag) return
    const distance = event.clientX - drag.startX
    if (Math.abs(distance) > 4) drag.moved = true
    trackRef.current.scrollLeft = drag.scrollLeft - distance
  }

  function endDrag() {
    const drag = dragRef.current
    dragRef.current = null
    // A real drag should not also count as a click on the card under the pointer.
    if (drag?.moved) {
      trackRef.current.addEventListener('click', (event) => event.stopPropagation(), { capture: true, once: true })
    }
  }

  return (
    <div className="carousel" role="region" aria-label={label}>
      <button className="carousel-arrow carousel-arrow-prev" type="button" onClick={() => scrollByPage(-1)} disabled={edges.atStart} aria-label="Scroll left">
        <ChevronLeft size={20} />
      </button>
      <ul
        ref={trackRef}
        className="carousel-track"
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {children}
      </ul>
      <button className="carousel-arrow carousel-arrow-next" type="button" onClick={() => scrollByPage(1)} disabled={edges.atEnd} aria-label="Scroll right">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
