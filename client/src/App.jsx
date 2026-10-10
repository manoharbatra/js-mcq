import { useEffect, useRef, useState } from 'react'
import { fetchCatalog } from './api.js'
import { buildPath, parseRoute, usePathname } from './router.js'
import { useTheme } from './useTheme.js'
import { ChevronRight, Menu, Moon, Sun } from 'lucide-react'
import { Link } from './components/Link.jsx'
import { Overview } from './components/Overview.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { StatusCard } from './components/StatusCard.jsx'
import { SectionPage } from './components/SectionPage.jsx'
import { TopicPage } from './components/TopicPage.jsx'
import './App.css'

const appName = 'JS MCQ Practice'

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function Breadcrumbs({ route, technology, section, topic }) {
  const crumbs = [{ label: 'Study topics', to: '/' }]
  if (route.technologySlug) {
    crumbs.push({ label: technology?.name ?? route.technologySlug, to: buildPath(route.technologySlug) })
  }
  if (route.sectionSlug) {
    crumbs.push({ label: section?.name ?? route.sectionSlug, to: buildPath(route.technologySlug, route.sectionSlug) })
  }
  if (route.topicSlug) {
    crumbs.push({ label: topic?.name ?? route.topicSlug, to: buildPath(route.technologySlug, route.sectionSlug, route.topicSlug) })
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => (
          <li key={crumb.to}>
            {index === crumbs.length - 1
              ? <span aria-current="page">{crumb.label}</span>
              : <><Link to={crumb.to}>{crumb.label}</Link><ChevronRight size={14} className="crumb-divider" /></>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function App() {
  const [theme, toggleTheme] = useTheme()
  const pathname = usePathname()
  const route = parseRoute(pathname)
  const contentRef = useRef(null)
  const [catalogState, setCatalogState] = useState({ status: 'loading', technologies: [], error: '' })
  const [catalogRequestId, setCatalogRequestId] = useState(0)
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchCatalog(controller.signal)
      .then((technologies) => setCatalogState({ status: 'ready', technologies, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setCatalogState({ status: 'error', technologies: [], error: error.message })
      })
    return () => controller.abort()
  }, [catalogRequestId])

  const { status, technologies, error } = catalogState
  const technology = technologies.find(({ slug }) => slug === route.technologySlug) ?? null
  const section = technology?.sections.find(({ slug }) => slug === route.sectionSlug) ?? null
  const topic = section?.topics.find(({ slug }) => slug === route.topicSlug) ?? null
  const isHome = !route.technologySlug

  useEffect(() => {
    document.title = [topic?.name, section?.name, technology?.name, appName].filter(Boolean).join(' · ')
  }, [technology, section, topic])

  // Pages scroll inside the content area, so reset it when the route changes.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    if (!isNavOpen) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsNavOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isNavOpen])

  function retryCatalog() {
    setCatalogState({ status: 'loading', technologies: [], error: '' })
    setCatalogRequestId((id) => id + 1)
  }

  let page
  if (status === 'loading') {
    page = <StatusCard isLoading message="Loading study topics…" />
  } else if (status === 'error') {
    page = <StatusCard isError title="Couldn’t load practice content" message={error} onRetry={retryCatalog} />
  } else if (route.technologySlug && !technology) {
    page = <StatusCard title="Technology not found" message="This technology doesn’t exist or may have been renamed." homeLink />
  } else if (route.sectionSlug && !section) {
    page = <StatusCard title="Section not found" message={`There is no “${route.sectionSlug}” section in ${technology.name}.`} homeLink />
  } else if (route.topicSlug && !topic) {
    page = <StatusCard title="Topic not found" message={`There is no “${route.topicSlug}” topic in ${section.name}.`} homeLink />
  } else if (topic) {
    page = <TopicPage key={topic.id} technology={technology} section={section} topic={topic} />
  } else if (section) {
    page = <SectionPage technology={technology} section={section} />
  } else if (technology) {
    page = (
      <Overview
        title={technology.name}
        description={`Pick a ${technology.name} topic to start practicing.`}
        emptyTitle="No sections yet"
        emptyMessage="Sections for this technology will appear here once they’re created."
        cards={technology.sections.map((item) => ({
          id: item.id,
          name: item.name,
          badgeName: item.name,
          meta: `${countLabel(item.topics.length, 'topic')} · ${countLabel(item.questionCount, 'question')}`,
          emptyNote: 'No topics yet.',
          links: item.topics.map((topicItem) => ({
            id: topicItem.id,
            name: topicItem.name,
            meta: countLabel(topicItem.questionCount, 'question'),
            to: buildPath(technology.slug, item.slug, topicItem.slug),
          })),
        }))}
      />
    )
  } else {
    page = (
      <Overview
        title="Study topics"
        description="Pick a technology and section, then work through its topics."
        emptyTitle="No technologies available yet"
        emptyMessage="Technologies will appear here once they’re created."
        cards={technologies.map((item) => ({
          id: item.id,
          name: item.name,
          badgeName: item.name,
          icon: item.icon,
          meta: countLabel(item.sections.length, 'section'),
          emptyNote: 'No sections yet.',
          links: item.sections.map((sectionItem) => ({
            id: sectionItem.id,
            name: sectionItem.name,
            meta: `${countLabel(sectionItem.topics.length, 'topic')} · ${countLabel(sectionItem.questionCount, 'question')}`,
            to: buildPath(item.slug, sectionItem.slug),
          })),
        }))}
      />
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        catalogState={catalogState}
        activeTechnologySlug={route.technologySlug}
        activeSectionSlug={route.sectionSlug}
        isHome={isHome}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
      {isNavOpen && <div className="sidebar-backdrop" onClick={() => setIsNavOpen(false)} aria-hidden="true" />}

      <div className="main">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation"
            aria-controls="site-nav"
            aria-expanded={isNavOpen}
          >
            <Menu size={18} />
          </button>
          <Breadcrumbs route={route} technology={technology} section={section} topic={topic} />
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className={`content ${topic ? 'content-split' : ''}`} ref={contentRef}>{page}</main>
      </div>
    </div>
  )
}

export default App
