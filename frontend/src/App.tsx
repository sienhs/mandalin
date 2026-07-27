import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import TestHubPage from './pages/TestHubPage'

// 추후 로딩하게 변경, 페이지 글씨 충돌 생겨서 나중에 수정해야함
const VillagePage = lazy(() => import('./pages/VillagePage'))
const ThumbnailStudioPage = lazy(() => import('./pages/ThumbnailStudioPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const PremiumGalleryPage = lazy(() => import('./pages/PremiumGalleryPage'))
const InspectPage = lazy(() => import('./pages/InspectPage'))

function Loading() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#5a6b76' }}>
      뭔가 로딩중이라는걸 보여주기 위해 임시로 추가한 것
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
