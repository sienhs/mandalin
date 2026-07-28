import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import FriendsPage from '../pages/FriendsPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import OAuthCallbackPage from '../pages/OAuthCallbackPage'
import TestHubPage from '../pages/TestHubPage'

const VillagePage = lazy(() => import('../pages/VillagePage'))
const ThumbnailStudioPage = lazy(() => import('../pages/ThumbnailStudioPage'))
const GalleryPage = lazy(() => import('../pages/GalleryPage'))
const PremiumGalleryPage = lazy(() => import('../pages/PremiumGalleryPage'))
const InspectPage = lazy(() => import('../pages/InspectPage'))

function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center font-sans text-[#5a6b76]">
      뭔가 로딩중이라는걸 보여주기 위해 임시로 추가한 것
    </div>
  )
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/test" element={<TestHubPage />} />
      <Route
        path="/village"
        element={
          <LazyPage>
            <VillagePage />
          </LazyPage>
        }
      />
      <Route
        path="/thumbnails"
        element={
          <LazyPage>
            <ThumbnailStudioPage />
          </LazyPage>
        }
      />
      <Route
        path="/gallery"
        element={
          <LazyPage>
            <GalleryPage />
          </LazyPage>
        }
      />
      <Route
        path="/premium"
        element={
          <LazyPage>
            <PremiumGalleryPage />
          </LazyPage>
        }
      />
      <Route
        path="/inspect"
        element={
          <LazyPage>
            <InspectPage />
          </LazyPage>
        }
      />
    </Routes>
  )
}
