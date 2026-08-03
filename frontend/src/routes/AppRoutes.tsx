import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingFallback from '../components/common/LoadingFallback'
import AppShell from '../components/common/AppShell'
import { useStore } from '../data/store'

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
import SheetDetail from '../pages/SheetDetail'
import SheetList from '../pages/SheetList'
import ShopPage from '../pages/ShopPage'

/* 그룹 만다라트 — 새 디자인 범위 밖이지만 기능은 살려 둔다. */
import GroupDetail from '../pages/GroupDetail'
import GroupSetup from '../pages/GroupSetup'

/**
 * 3D(three.js)를 쓰는 화면은 lazy 로 끊는다.
 * 정적 import 하면 three.js 860KB 가 메인 번들에 들어가, 랜딩만 보러 온 방문자까지
 * 3D 엔진을 통째로 내려받게 된다.
 */
const VillagePage = lazy(() => import('../pages/VillagePage'))

/**
 * 개발·시연 전용 화면.
 *
 * <p>예전에는 이 경로들이 인증 밖에 그대로 열려 있어서 주소만 알면 누구나 들어갔고,
 * 마을 화면의 임시 내비게이션이 이것들을 정식 메뉴처럼 보여줬다. `/dev/*` 로 옮기고
 * 개발 빌드에서만 등록한다.
 */
const GalleryPage = lazy(() => import('../pages/GalleryPage'))
const PremiumGalleryPage = lazy(() => import('../pages/PremiumGalleryPage'))
const ThumbnailStudioPage = lazy(() => import('../pages/ThumbnailStudioPage'))
const InspectPage = lazy(() => import('../pages/InspectPage'))
const TestHubPage = lazy(() => import('../pages/TestHubPage'))

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

/**
 * 세션 복원이 끝나기 전에는 판단하지 않는다.
 *
 * <p>새로고침 직후에는 액세스 토큰이 없고 리프레시 쿠키로 되살리는 동안 잠깐 비로그인처럼
 * 보이는데, 그때 로그인 화면으로 튕기면 멀쩡한 세션이 끊긴다.
 */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session } = useStore()
  const location = useLocation()

  if (session === 'checking') {
    return <LoadingFallback />
  }
  if (session === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

export default function AppRoutes() {
  const { session } = useStore()
  const isDev = import.meta.env.DEV

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={session === 'authed' ? <Navigate to="/app" replace /> : <LoginPage />}
      />
      {/* 카카오 로그인 후 백엔드가 되돌려 보내는 자리. code 를 토큰으로 교환한다. */}
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="sheets" element={<SheetList />} />
        {/* 고정 경로(new)를 :sheetId 보다 먼저 둔다. */}
        <Route path="sheets/new" element={<SheetCreate />} />
        <Route path="sheets/:sheetId" element={<SheetDetail />} />
        {/*
          친구 만다라트. 소유자를 데이터로 판별하지 않고 경로로 가른다 —
          이 경로로 들어온 상세는 언제나 남의 것이라 읽기 전용이다.
        */}
        <Route path="friends/:friendId/sheets/:sheetId" element={<SheetDetail readOnly />} />
        <Route path="coach" element={<AiCoachPage />} />
        <Route
          path="village"
          element={
            <Lazy>
              <VillagePage />
            </Lazy>
          }
        />
        <Route path="shop" element={<ShopPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="me" element={<MyPage />} />

        {/* 그룹 만다라트 — 예전 화면 그대로. 새 셸 안에서 뜬다. */}
        <Route path="group/new" element={<GroupSetup mode="create" />} />
        <Route path="group/:groupId/join" element={<GroupSetup mode="join" />} />
        <Route path="group/:groupId" element={<GroupDetail />} />
      </Route>

      {/* 개발 빌드에서만 등록된다. */}
      {isDev && (
        <>
          <Route path="/dev" element={<Lazy><TestHubPage /></Lazy>} />
          <Route path="/dev/gallery" element={<Lazy><GalleryPage /></Lazy>} />
          <Route path="/dev/premium" element={<Lazy><PremiumGalleryPage /></Lazy>} />
          <Route path="/dev/thumbnails" element={<Lazy><ThumbnailStudioPage /></Lazy>} />
          <Route path="/dev/inspect" element={<Lazy><InspectPage /></Lazy>} />
        </>
      )}

      {/* 예전 주소로 들어온 링크를 새 위치로 넘긴다. 북마크가 깨지지 않게. */}
      <Route path="/home" element={<Navigate to="/app" replace />} />
      <Route path="/sheets" element={<Navigate to="/app/sheets" replace />} />
      <Route path="/sheet/create" element={<Navigate to="/app/sheets/new" replace />} />
      <Route path="/village" element={<Navigate to="/app/village" replace />} />
      <Route path="/shop" element={<Navigate to="/app/shop" replace />} />
      <Route path="/report" element={<Navigate to="/app/report" replace />} />
      <Route path="/friends" element={<Navigate to="/app/friends" replace />} />
      <Route path="/leaderboard" element={<Navigate to="/app/leaderboard" replace />} />
      <Route path="/mypage" element={<Navigate to="/app/me" replace />} />
      <Route path="/ai-coach" element={<Navigate to="/app/coach" replace />} />

      {/* 위 어디에도 안 걸리면 백지 대신 404. 반드시 마지막에 둔다. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
