import './TopicBadge.css'
const toneCount = 6

function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getTone(name) {
  let hash = 0
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return hash % toneCount
}

// Initials on a colour picked from the name, so each badge stays the same between visits.
export function TopicBadge({ name, size = 'md' }) {
  return <span className={`topic-badge topic-badge-${size} tone-${getTone(name)}`} aria-hidden="true">{getInitials(name)}</span>
}
