import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoadingFallback from '../components/common/LoadingFallback'
import FriendsPage from '../pages/FriendsPage'
import HomePage from '../pages/HomePage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import OAuthCallbackPage from '../pages/OAuthCallbackPage'
import TestHubPage from '../pages/TestHubPage'
import SheetCreate from '../pages/SheetCreate'
import SheetList from '../pages/SheetList'
import ProtectedRoute from './ProtectedRoute'


/**
 * 3D(three.js)를 쓰는 화면은 lazy 로 끊는다.
 * 정적 import 하면 three.js 860KB 가 메인 번들에 들어가, 랜딩만 보러 온 방문자까지
 * 3D 엔진을 통째로 내려받게 된다.
 */
const VillagePage = lazy(() => import('../pages/VillagePage'))
const GalleryPage = lazy(() => import('../pages/GalleryPage'))
const PremiumGalleryPage = lazy(() => import('../pages/PremiumGalleryPage'))
const ThumbnailStudioPage = lazy(() => import('../pages/ThumbnailStudioPage'))
const InspectPage = lazy(() => import('../pages/InspectPage'))

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sheet/create" element={<SheetCreate />} />
      <Route path="/sheets" element={<SheetList />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/test" element={<TestHubPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/village" element={<Lazy><VillagePage /></Lazy>} />
      </Route>
      <Route path="/thumbnails" element={<Lazy><ThumbnailStudioPage /></Lazy>} />
      <Route path="/gallery" element={<Lazy><GalleryPage /></Lazy>} />
      <Route path="/premium" element={<Lazy><PremiumGalleryPage /></Lazy>} />
      <Route path="/inspect" element={<Lazy><InspectPage /></Lazy>} />
    </Routes>
  )
}
