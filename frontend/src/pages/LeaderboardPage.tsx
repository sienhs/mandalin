import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import type { LeaderboardEntry } from '../data/types'
import Button from '../components/common/ActionButton'
import { Avatar, Badge, EmptyState, ErrorState, Skeleton } from '../components/common/Primitives'
import { IconHeart } from '../components/common/Icons'
import { cn } from '../utils/cn'
import { num } from '../utils/format'

const MEDALS = ['🥇', '🥈', '🥉'] as const

export default function Leaderboard() {
  const { gateway, user, sheets } = useStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true)
      setError(null)
      try {
        const res = await gateway.leaderboard(targetPage)
        setEntries(res.entries)
        setTotalPages(Math.max(1, res.totalPages))
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : '리더보드를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [gateway],
  )

  useEffect(() => {
    void load(page)
  }, [load, page])

  const mySheetIds = new Set(sheets.data.map((s) => s.id))

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="page-title">리더보드</h1>
        <p className="page-caption">
          공개된 만다라트를 좋아요 순으로 줄 세웁니다. 비공개 표는 올라가지 않아요.
        </p>
      </header>

      {loading && entries.length === 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-[92px] w-full" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load(page)} />
      ) : entries.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="🏆"
            title="아직 공개된 만다라트가 없어요"
            body="내 만다라트를 공개로 만들면 이 목록에 올라가고, 다른 사람들이 좋아요를 누를 수 있어요."
            action={<Button to="/app/sheets">내 만다라트로 가기</Button>}
          />
        </div>
      ) : (
        <>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {entries.map((entry, i) => {
              const isMine = mySheetIds.has(entry.sheetId) || entry.name === user?.name
              return (
                <li
                  key={entry.sheetId}
                  className="animate-rise"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <article
                    className={cn(
                      'card flex flex-wrap items-center gap-4 p-5',
                      isMine && 'ring-2 ring-brand-400/40',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-2xl text-[15px] font-black tabular-nums',
                        entry.rank <= 3 ? 'text-xl' : 'muted',
                      )}
                      style={{ background: 'var(--surface-sunken)' }}
                      aria-label={`${entry.rank}위`}
                    >
                      {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
                    </span>

                    <Avatar name={entry.name} size={40} />

                    <div className="min-w-[180px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isMine ? (
                          <Link
                            to={`/app/sheets/${entry.sheetId}`}
                            className="text-[14.5px] font-extrabold no-underline hover:text-brand-600"
                          >
                            {entry.title}
                          </Link>
                        ) : (
                          <span className="text-[14.5px] font-extrabold">{entry.title}</span>
                        )}
                        {isMine && <Badge tone="brand">내 만다라트</Badge>}
                      </div>
                      <p className="muted m-0 mt-1 text-[11.5px] font-bold">{entry.name}</p>
                    </div>

                    <span
                      className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-black text-[var(--text-muted)]"
                      style={{ borderColor: 'var(--border-hairline)' }}
                      aria-label={`좋아요 ${entry.likeCount}`}
                    >
                      {/*
                        하트만 색을 채운다. 이 줄에서 순위를 가르는 값이 좋아요 수인데,
                        선 아이콘에 흐린 회색이면 옆의 다른 회색 글자와 구분되지 않아
                        숫자가 무엇을 세는지 한 번 읽어야 알 수 있었다.

                        `fill` 은 아이콘 자신의 `fill="none"` 속성을 눌러야 하므로 클래스로
                        준다(CSS 가 표현 속성을 이긴다). 색은 상세 화면의 좋아요 버튼과 같은
                        rose 다 — 같은 것을 세는 자리라 색까지 같아야 한 벌로 읽힌다.
                      */}
                      <IconHeart className="size-[17px] fill-rose-500 text-rose-500" />
                      {num(entry.likeCount)}
                    </span>
                  </article>
                </li>
              )
            })}
          </ol>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2" aria-label="페이지">
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <span className="muted px-2 text-[12.5px] font-bold tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                다음
              </Button>
            </nav>
          )}


        </>
      )}
    </div>
  )
}
