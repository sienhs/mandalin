import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import TestHubPage from './pages/TestHubPage'

// three.js를 쓰는 무거운 페이지는 지연 로딩 → 로그인/콜백 초기 번들에서 제외
const VillagePage = lazy(() => import('./pages/VillagePage'))
const ThumbnailStudioPage = lazy(() => import('./pages/ThumbnailStudioPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const PremiumGalleryPage = lazy(() => import('./pages/PremiumGalleryPage'))
const InspectPage = lazy(() => import('./pages/InspectPage'))

function Loading() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#5a6b76' }}>
      마을 불러오는 중…
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/test" element={<TestHubPage />} />
        <Route
          path="/village"
          element={
            <Suspense fallback={<Loading />}>
              <VillagePage />
            </Suspense>
          }
        />
        <Route
          path="/thumbnails"
          element={
            <Suspense fallback={<Loading />}>
              <ThumbnailStudioPage />
            </Suspense>
          }
        />
        <Route
          path="/gallery"
          element={
            <Suspense fallback={<Loading />}>
              <GalleryPage />
            </Suspense>
          }
        />
        <Route
          path="/premium"
          element={
            <Suspense fallback={<Loading />}>
              <PremiumGalleryPage />
            </Suspense>
          }
        />
        <Route
          path="/inspect"
          element={
            <Suspense fallback={<Loading />}>
              <InspectPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
