import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoadingFallback from '../components/common/LoadingFallback'
import AiCoachPage from '../pages/AiCoachPage'
import FriendsPage from '../pages/FriendsPage'
import HomePage from '../pages/HomePage'
import LandingPage from '../pages/LandingPage'
import LeaderboardPage from '../pages/LeaderboardPage'
import LoginPage from '../pages/LoginPage'
import MyPage from '../pages/MyPage'
import NotFoundPage from '../pages/NotFoundPage'
import OAuthCallbackPage from '../pages/OAuthCallbackPage'
import ReportPage from '../pages/ReportPage'
import SheetCreate from '../pages/SheetCreate'
import SheetList from '../pages/SheetList'
import ShopPage from '../pages/ShopPage'
import TestHubPage from '../pages/TestHubPage'
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
      <Route path="/ai-coach" element={<AiCoachPage />} />
      <Route path="/sheet/create" element={<SheetCreate />} />
      <Route path="/sheets" element={<SheetList />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/test" element={<TestHubPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route
          path="/village"
          element={
            <Lazy>
              <VillagePage />
            </Lazy>
          }
        />
      </Route>
      <Route
        path="/thumbnails"
        element={
          <Lazy>
            <ThumbnailStudioPage />
          </Lazy>
        }
      />
      <Route
        path="/gallery"
        element={
          <Lazy>
            <GalleryPage />
          </Lazy>
        }
      />
      <Route
        path="/premium"
        element={
          <Lazy>
            <PremiumGalleryPage />
          </Lazy>
        }
      />
      <Route
        path="/inspect"
        element={
          <Lazy>
            <InspectPage />
          </Lazy>
        }
      />
      {/* 위 어디에도 안 걸리면 백지 대신 404. 반드시 마지막에 둔다. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
