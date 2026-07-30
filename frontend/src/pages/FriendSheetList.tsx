import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/common/Header'
import { MOCK_FRIENDS } from '../components/friends/friends.data'
import SheetListCard from '../components/sheetList/SheetListCard'
import { fetchAchievementRates, fetchFriendSheets } from '../components/sheetList/sheetList.api'
import type { SheetSummary } from '../components/sheetList/sheetList.types'
import '../styles/sheet-list.css'

/**
 * 친구의 만다라트 목록 화면.
 *
 * 내 목록(SheetList)과 다른 점: 만들거나 지우거나 초대하는 동작이 전부 없고,
 * 공개된 시트만 보이고, 카드를 누르면 읽기 전용 상세로 간다.
 * 그룹 만다라트는 남의 그룹이라 여기서는 보여주지 않는다.
 */
export default function FriendSheetList() {
  const navigate = useNavigate()
  const { friendId } = useParams()
  const id = Number(friendId)

  /**
   * 친구 이름. 친구 목록에서 넘어올 때 함께 받고(FriendResponse.name),
   * 주소를 직접 열거나 새로고침해서 그 값이 없으면 친구 목록에서 찾는다.
   */
  const { state } = useLocation()
  const passedName = (state as { friendName?: string } | null)?.friendName
  const friendName = passedName ?? MOCK_FRIENDS.find((friend) => friend.id === id)?.name ?? '친구'

  const [sheets, setSheets] = useState<SheetSummary[] | null>(null)
  /** 시트별 달성률. 목록 응답에 없어서 따로 받아온다. 도착 전에는 카드가 '—%' 로 보인다. */
  const [rates, setRates] = useState<Map<number, number>>(new Map())

  useEffect(() => {
    let alive = true
    fetchFriendSheets(id)
      .then((next) => {
        if (alive) setSheets(next)
      })
      .catch(() => {
        if (alive) setSheets([])
      })
    return () => {
      alive = false
    }
  }, [id])

  // 목록이 온 뒤에 달성률을 받는다 — 시트 아이디를 알아야 상세를 부를 수 있다.
  useEffect(() => {
    if (!sheets) return
    let alive = true
    fetchAchievementRates(sheets.map((sheet) => sheet.sheetId))
      .then((next) => {
        if (alive) setRates(next)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [sheets])

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-6 pb-[70px] pt-8">
        <header className="mb-5">
          <h1 className="sheet-list-heading">{friendName}님의 만다라트 목록</h1>
        </header>

        <section aria-label={`${friendName}님의 만다라트`}>
          {sheets === null ? (
            <p className="m-0 py-14 text-center text-[13.5px] font-semibold text-ink-400">
              만다라트를 불러오는 중이에요.
            </p>
          ) : sheets.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sheets.map((sheet) => (
                <li key={sheet.sheetId}>
                  {/* onRemove 를 넘기지 않으므로 카드에 삭제 버튼이 없다. */}
                  <SheetListCard
                    sheet={sheet}
                    achievementRate={rates.get(sheet.sheetId) ?? null}
                    onOpen={(sheetId) => navigate(`/friends/${id}/sheet/${sheetId}`)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 py-14 text-center text-[13.5px] font-semibold text-ink-400">
              {friendName}님이 공개한 만다라트가 없어요.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
