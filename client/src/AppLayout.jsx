import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router'
import { BookOpen, ChevronRight, Menu, Mic, Moon, Sun } from 'lucide-react'
import { fetchCatalog } from './api.js'
import { buildPath } from './paths.js'
import { useTheme } from './useTheme.js'
import { AnnouncementBar } from './components/announcementBar'
import { Sidebar } from './components/sidebar'
import { StatusCard } from './components/statusCard'

const appName = 'Manohar Batra'

// Pages that aren't part of the topic catalog, with their breadcrumb/title label.
const staticPages = { '/courses': 'Courses', '/podcasts': 'Podcasts' }

const topbarLinks = [
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/podcasts', label: 'Podcasts', icon: Mic },
]

function Breadcrumbs({ pathname, slugs, technology, section, topic }) {
  const crumbs = [{ label: 'Home', to: '/' }]
  if (staticPages[pathname]) crumbs.push({ label: staticPages[pathname], to: pathname })
  if (slugs.technologySlug) {
    crumbs.push({ label: technology?.name ?? slugs.technologySlug, to: buildPath(slugs.technologySlug) })
  }
  if (slugs.sectionSlug) {
    crumbs.push({ label: section?.name ?? slugs.sectionSlug, to: buildPath(slugs.technologySlug, slugs.sectionSlug) })
  }
  if (slugs.topicSlug) {
    crumbs.push({ label: topic?.name ?? slugs.topicSlug, to: buildPath(slugs.technologySlug, slugs.sectionSlug, slugs.topicSlug) })
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

// Shell for every learner page: loads the catalog once, resolves the URL slugs against it,
// and hands the result to the matched page through the outlet context.
export function AppLayout() {
  const [theme, toggleTheme] = useTheme()
  const { pathname } = useLocation()
  const params = useParams()
  const slugs = {
    technologySlug: params.technologySlug?.toLowerCase() ?? '',
    sectionSlug: params.sectionSlug?.toLowerCase() ?? '',
    topicSlug: params.topicSlug?.toLowerCase() ?? '',
  }
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
  const technology = technologies.find(({ slug }) => slug === slugs.technologySlug) ?? null
  const section = technology?.sections.find(({ slug }) => slug === slugs.sectionSlug) ?? null
  const topic = section?.topics.find(({ slug }) => slug === slugs.topicSlug) ?? null

  useEffect(() => {
    const parts = technology ? [topic?.name, section?.name, technology.name] : [staticPages[pathname]]
    document.title = [...parts, appName].filter(Boolean).join(' · ')
  }, [pathname, technology, section, topic])

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

  // Home, courses and podcasts don't depend on the catalog, so only topic pages wait for it.
  const needsCatalog = Boolean(slugs.technologySlug)
  let content
  if (needsCatalog && status === 'loading') {
    content = <StatusCard isLoading message="Loading study topics…" />
  } else if (needsCatalog && status === 'error') {
    content = <StatusCard isError title="Couldn’t load practice content" message={error} onRetry={retryCatalog} />
  } else if (slugs.technologySlug && !technology) {
    content = <StatusCard title="Technology not found" message="This technology doesn’t exist or may have been renamed." homeLink />
  } else if (slugs.sectionSlug && !section) {
    content = <StatusCard title="Section not found" message={`There is no “${slugs.sectionSlug}” section in ${technology.name}.`} homeLink />
  } else if (slugs.topicSlug && !topic) {
    content = <StatusCard title="Topic not found" message={`There is no “${slugs.topicSlug}” topic in ${section.name}.`} homeLink />
  } else {
    content = (
      <Suspense fallback={<StatusCard isLoading message="Loading page…" />}>
        <Outlet context={{ technologies, technology, section, topic }} />
      </Suspense>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        catalogState={catalogState}
        activeTechnologySlug={slugs.technologySlug}
        activeSectionSlug={slugs.sectionSlug}
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
          <Breadcrumbs pathname={pathname} slugs={slugs} technology={technology} section={section} topic={topic} />
          <nav className="topbar-links" aria-label="Pages">
            {topbarLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`}>
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
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
        {pathname === '/' && <AnnouncementBar />}
        <main className={`content ${topic ? 'content-split' : ''}`} ref={contentRef}>{content}</main>
      </div>
    </div>
  )
}
