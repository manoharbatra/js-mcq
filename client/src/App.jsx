import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { AppLayout } from './AppLayout.jsx'
import './App.css'

// Every page is its own chunk, fetched the first time its route is visited.
const page = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })))
const HomePage = page(() => import('./pages/HomePage.jsx'), 'HomePage')
const CoursesPage = page(() => import('./pages/CoursesPage.jsx'), 'CoursesPage')
const PodcastsPage = page(() => import('./pages/PodcastsPage.jsx'), 'PodcastsPage')
const TechnologyPage = page(() => import('./pages/TechnologyPage.jsx'), 'TechnologyPage')
const SectionRoute = page(() => import('./pages/SectionRoute.jsx'), 'SectionRoute')
const TopicRoute = page(() => import('./pages/TopicRoute.jsx'), 'TopicRoute')
const NotFoundPage = page(() => import('./pages/NotFoundPage.jsx'), 'NotFoundPage')

// One shell (sidebar + top bar) for every page. Static routes rank above the slug routes,
// so /courses and /podcasts are never read as technology slugs.
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="podcasts" element={<PodcastsPage />} />
        <Route path=":technologySlug" element={<TechnologyPage />} />
        <Route path=":technologySlug/:sectionSlug" element={<SectionRoute />} />
        <Route path=":technologySlug/:sectionSlug/:topicSlug" element={<TopicRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
