import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { initTheme } from './store/themeSlice'
import Navbar from './components/Navbar'

// Lazy-load pages (demonstrates code splitting / performance optimization)
const Dashboard  = lazy(() => import('./pages/Dashboard'))
const Explore    = lazy(() => import('./pages/Explore'))
const Compare    = lazy(() => import('./pages/Compare'))
const Favorites  = lazy(() => import('./pages/Favorites'))
const CityDetail = lazy(() => import('./pages/CityDetail'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading page...</span>
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch()

  // Initialize theme on app start
  useEffect(() => {
    dispatch(initTheme())
  }, [dispatch])

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingBottom: '4rem' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/explore"      element={<Explore />} />
            <Route path="/compare"      element={<Compare />} />
            <Route path="/favorites"    element={<Favorites />} />
            <Route path="/city/:cityName" element={<CityDetail />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem 2rem', gap: '1rem', textAlign: 'center' }}>
      <span style={{ fontSize: '4rem' }}>404</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h2>
      <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to Dashboard</a>
    </div>
  )
}
