import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoadingFallback from '../components/common/LoadingFallback'
import FriendSheetList from '../pages/FriendSheetList'
import GroupDetail from '../pages/GroupDetail'
import GroupSetup from '../pages/GroupSetup'
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
// AI 코치도 같은 이유다 — livekit-client 가 메인 번들을 gzip 240KB 로 불린다(끊으면 104KB).
const AiCoachPage = lazy(() => import('../pages/AiCoachPage'))

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sheet/create" element={<SheetCreate />} />
      {/* 고정 경로(/sheet/create)가 :sheetId 보다 먼저 잡히므로 순서와 무관하게 안전하다. */}
      <Route path="/sheet/:sheetId" element={<SheetDetail />} />
      <Route path="/sheets" element={<SheetList />} />
      {/*
        친구 만다라트. 소유자를 데이터로 판별하지 않고 이 경로로 구분한다 —
        여기로 들어온 상세는 항상 남의 것이므로 읽기 전용이다.
      */}
      {/*
        그룹 만다라트에 내 도메인 2개를 넣는 화면. 같은 화면을 두 경로가 쓴다 —
        new = 내가 그룹을 만든다(이름을 정한다), join = 초대를 수락해 들어간다.
      */}
      <Route path="/group/new" element={<GroupSetup mode="create" />} />
      <Route path="/group/:groupId/join" element={<GroupSetup mode="join" />} />
      {/* 고정 경로(new)가 :groupId 보다 먼저 잡히므로 순서와 무관하게 안전하다. */}
      <Route path="/group/:groupId" element={<GroupDetail />} />
      <Route path="/friends/:friendId/sheets" element={<FriendSheetList />} />
      <Route path="/friends/:friendId/sheet/:sheetId" element={<SheetDetail readOnly />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/test" element={<TestHubPage />} />
      <Route element={<ProtectedRoute />}>
        {/* 입장 토큰 발급에 로그인이 필요하다. 밖에 두면 연결 버튼이 401 로만 끝난다. */}
        <Route
          path="/ai-coach"
          element={
            <Lazy>
              <AiCoachPage />
            </Lazy>
          }
        />
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
