import { useEffect, useMemo, useState } from 'react'
import Header from '../components/common/Header'
import { fetchLeaderboard } from '../components/leaderboard/leaderboard.api'
import LeaderboardPagination from '../components/leaderboard/LeaderboardPagination'
import LeaderboardRow from '../components/leaderboard/LeaderboardRow'
import type { LeaderboardEntry } from '../components/leaderboard/leaderboard.types'
import '../styles/leaderboard.css'

type LeaderboardPageProps = {
  initialEntries?: LeaderboardEntry[]
}

const ITEMS_PER_PAGE = 10

/** 공개 만다라트를 좋아요 수가 높은 순서대로 보여주는 페이지. */
export default function LeaderboardPage({
  initialEntries,
}: LeaderboardPageProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(
    initialEntries ?? [],
  )
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(initialEntries === undefined)
  const [loadError, setLoadError] = useState(false)
  const pageCount = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const stateMessage = isLoading
    ? '리더보드를 불러오는 중이에요.'
    : loadError
      ? '리더보드를 불러오지 못했어요.'
      : entries.length === 0
        ? '아직 공개된 만다라트가 없어요.'
        : null

  const visibleEntries = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return entries.slice(start, start + ITEMS_PER_PAGE)
  }, [entries, safePage])

  useEffect(() => {
    if (initialEntries !== undefined) {
      setEntries(initialEntries)
      setIsLoading(false)
      return
    }

    let isActive = true
    fetchLeaderboard()
      .then((data) => {
        if (isActive) setEntries(data)
      })
      .catch(() => {
        if (isActive) setLoadError(true)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [initialEntries])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  return (
    <div className="page-shell">
      <Header />

      <main className="leaderboard-main">
        <h1 className="text-2xl font-extrabold tracking-[-0.04em]">리더보드</h1>

        <section className="leaderboard-panel">
          <h2 className="text-xl font-extrabold tracking-[-0.035em]">
            좋아요 랭킹
          </h2>

          {stateMessage ? (
            <p
              className="leaderboard-state"
              role={isLoading ? 'status' : undefined}
            >
              {stateMessage}
            </p>
          ) : (
            <>
              <ol className="leaderboard-list">
                {visibleEntries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.sheetId}
                    entry={entry}
                    rank={(safePage - 1) * ITEMS_PER_PAGE + index + 1}
                  />
                ))}
              </ol>
              <LeaderboardPagination
                page={safePage}
                pageCount={pageCount}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </main>
    </div>
  )
}
