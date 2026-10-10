const toneCount = 6

// Known `icon` keys from the technologies collection get a fixed label and colour.
const knownIcons = {
  javascript: { label: 'JS', tone: 'javascript' },
  typescript: { label: 'TS', tone: 'typescript' },
  react: { label: '⚛', tone: 'react' },
  node: { label: 'N', tone: 'node' },
  nodejs: { label: 'N', tone: 'node' },
  'system-design': { label: 'SD', tone: 'system-design' },
  'ci-cd': { label: 'CI', tone: 'ci-cd' },
}

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

export function TopicBadge({ name, icon = '', size = 'md' }) {
  const known = knownIcons[icon]
  const label = known?.label ?? getInitials(name)
  const tone = known?.tone ?? getTone(name)
  return <span className={`topic-badge topic-badge-${size} tone-${tone}`} aria-hidden="true">{label}</span>
}
