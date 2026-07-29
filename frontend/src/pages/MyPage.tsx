import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/common/Header'
import MyPageStatCard from '../components/mypage/MyPageStatCard'
import NicknameEditModal from '../components/mypage/NicknameEditModal'
import {
  EMPTY_MY_PAGE_DATA,
  toMyPageStats,
} from '../components/mypage/mypage.data'
import type { MyPageData } from '../components/mypage/mypage.types'
import { useAuth } from '../contexts/auth'
import '../styles/mypage.css'

type MyPageProps = {
  initialData?: MyPageData
}

/** 사용자 프로필, ERD 기반 누적 통계, 주요 보유 항목 이동을 제공하는 마이페이지. */
export default function MyPage({ initialData }: MyPageProps) {
  const { user } = useAuth()
  const myPageData = initialData ?? EMPTY_MY_PAGE_DATA
  const receivedNickname =
    user?.name ?? initialData?.user.name ?? EMPTY_MY_PAGE_DATA.user.name
  const [nickname, setNickname] = useState(
    receivedNickname,
  )
  const [nicknameDraft, setNicknameDraft] = useState(nickname)
  const [isEditing, setIsEditing] = useState(false)
  const [profileImageFailed, setProfileImageFailed] = useState(false)
  const stats = toMyPageStats(myPageData.statistics)
  const point = user?.point ?? myPageData.user.point
  const profileImageUrl =
    user?.profileImageUrl ?? myPageData.user.profileImageUrl

  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileImageUrl])

  useEffect(() => {
    setNickname(receivedNickname)
    setNicknameDraft(receivedNickname)
  }, [receivedNickname])

  const saveNickname = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextNickname = nicknameDraft.trim()
    if (!nextNickname) return
    setNickname(nextNickname)
    setIsEditing(false)
  }

  const cancelNicknameEdit = () => {
    setNicknameDraft(nickname)
    setIsEditing(false)
  }

  return (
    <div className="page-shell">
      <Header
        fallbackPoint={point}
        fallbackProfileName={nickname}
      />

      <main className="mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-8 lg:py-10">
        <h1 className="text-2xl font-extrabold tracking-[-0.04em]">마이페이지</h1>
        <p className="mt-3 text-sm font-semibold text-slate-400">전체 통계, 수집품</p>

        <section
          className="mt-11 flex min-h-28 items-center gap-4 rounded-[22px] bg-white px-7 py-6 sm:gap-5 sm:px-9"
          aria-label="프로필"
        >
          <div
            className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-alert text-xl font-extrabold text-white"
            aria-hidden="true"
          >
            {profileImageUrl && !profileImageFailed ? (
              <img
                src={profileImageUrl}
                alt=""
                className="size-full object-cover"
                onError={() => setProfileImageFailed(true)}
              />
            ) : (
              nickname.slice(0, 1)
            )}
          </div>

          <strong className="min-w-0 flex-1 truncate text-lg font-extrabold">
            {nickname}님
          </strong>
          <button
            type="button"
            className="mypage-outline-button"
            onClick={() => setIsEditing(true)}
          >
            닉네임 변경
          </button>
        </section>

        <section className="mt-11 grid gap-5 md:grid-cols-3" aria-label="전체 통계">
          <MyPageStatCard
            label="총 수행한 과제"
            value={stats.completedTasks.toLocaleString('ko-KR')}
            suffix="개"
            tone="brand"
          />
          <MyPageStatCard
            label="보유한 건물"
            value={String(stats.ownedBuildings)}
            suffix={`/ ${stats.totalBuildings}개`}
            tone="blue"
            progress={
              stats.totalBuildings > 0
                ? (stats.ownedBuildings / stats.totalBuildings) * 100
                : 0
            }
          />
          <MyPageStatCard
            label="과제 달성률"
            value={`${stats.achievementRate}%`}
            tone="orange"
          />
        </section>

        <nav className="mt-7 grid gap-6 md:grid-cols-2" aria-label="마이페이지 바로가기">
          <Link
            to="/village"
            className="mypage-shortcut mypage-shortcut-mandalart"
          >
            <span className="text-2xl" aria-hidden="true">📁</span>
            <p className="mb-0 mt-2 text-base font-extrabold">내 만다라트 보기</p>
            <p className="mb-0 mt-2 text-sm font-semibold opacity-60">
              만다라트 목록으로 이동
            </p>
          </Link>
          <Link
            to="/gallery"
            className="mypage-shortcut mypage-shortcut-collection"
          >
            <span className="text-2xl" aria-hidden="true">🏆</span>
            <p className="mb-0 mt-2 text-base font-extrabold">수집품 보기</p>
            <p className="mb-0 mt-2 text-sm font-semibold opacity-60">
              모든 건물 컬렉션
            </p>
          </Link>
        </nav>
      </main>

      {isEditing && (
        <NicknameEditModal
          nickname={nicknameDraft}
          onNicknameChange={setNicknameDraft}
          onCancel={cancelNicknameEdit}
          onSave={saveNickname}
        />
      )}
    </div>
  )
}
