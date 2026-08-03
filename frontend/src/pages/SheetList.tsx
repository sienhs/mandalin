import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import type { Friend, Sheet } from '../data/types'
import MandalartGrid from '../features/sheet/MandalartGrid'
import Button from '../components/common/ActionButton'
import Modal from '../components/common/Modal'
import { IconHeart, IconPlus, IconSparkle, IconTrash } from '../components/common/Icons'
import {
  Badge,
  EmptyState,
  ErrorState,
  ProgressBar,
  Skeleton,
  domainColor,
} from '../components/common/Primitives'
import { formatDate } from '../utils/format'

function SheetCard({
  sheet,
  detail,
  onDelete,
}: {
  sheet: Sheet
  detail: Sheet | undefined
  onDelete: () => void
}) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <Link
        to={`/app/sheets/${sheet.id}`}
        className="flex flex-1 flex-col p-5 no-underline"
        aria-label={`${sheet.title} 만다라트 열기`}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-20 shrink-0 overflow-hidden rounded-lg p-1"
            style={{ background: 'var(--surface-sunken)' }}
          >
            {detail ? (
              <MandalartGrid sheet={detail} mini />
            ) : (
              <div className="aspect-square w-full">
                <Skeleton className="size-full" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Badge tone={sheet.isOpen ? 'brand' : 'neutral'}>
                {sheet.isOpen ? '공개' : '비공개'}
              </Badge>
              {sheet.achievementRate >= 100 && <Badge tone="success">완성</Badge>}
            </div>
            <h3 className="m-0 mt-2 truncate text-[15.5px] font-extrabold tracking-[-0.03em]">
              {sheet.title}
            </h3>
            <p className="muted m-0 mt-1 text-[11.5px] font-semibold">
              {formatDate(sheet.createdAt)} – {formatDate(sheet.expiredAt)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="muted text-[11.5px] font-bold">달성률</span>
            <strong className="text-[15px] font-black tabular-nums">
              {sheet.achievementRate}%
            </strong>
          </div>
          <ProgressBar
            value={sheet.achievementRate}
            color={domainColor(0)}
            label={`${sheet.title} 달성률`}
          />
        </div>

        <div
          className="muted mt-4 flex items-center gap-3 border-t pt-3 text-[11.5px] font-bold"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <span className="flex items-center gap-1">
            <IconHeart className="size-[13px]" />
            {sheet.likeCount}
          </span>
          {detail && (
            <span>
              과제 {detail.domains?.reduce((a, d) => a + d.subjects.length, 0) ?? 0}개
            </span>
          )}
          <span className="ml-auto text-brand-600 dark:text-brand-400">열기 →</span>
        </div>
      </Link>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`${sheet.title} 삭제`}
        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border-0 bg-[var(--surface-card)] text-[var(--text-muted)] opacity-0 shadow transition-all hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <IconTrash className="size-[15px]" />
      </button>
    </article>
  )
}

export default function Sheets() {
  const { sheets, details, friends, gateway, deleteSheet, reloadSheets } = useStore()
  const navigate = useNavigate()
  const [target, setTarget] = useState<Sheet | null>(null)
  const [busy, setBusy] = useState(false)

  /** 친구가 공개한 시트. 친구 수만큼 호출해야 해서 이 화면에서만 따로 받는다. */
  const [friendSheets, setFriendSheets] = useState<Array<{ friend: Friend; sheet: Sheet }>>([])

  useEffect(() => {
    let alive = true
    const run = async () => {
      const results = await Promise.all(
        friends.data.map(async (friend) => {
          try {
            const list = await gateway.friendSheets(friend.userId, friend.name)
            return list.map((sheet) => ({ friend, sheet }))
          } catch {
            return []
          }
        }),
      )
      if (alive) setFriendSheets(results.flat())
    }
    if (friends.data.length > 0) void run()
    else setFriendSheets([])
    return () => {
      alive = false
    }
  }, [friends.data, gateway])

  const detailMap = useMemo(() => details.data, [details.data])

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">내 만다라트</h1>
          <p className="page-caption">
            큰 목표를 81칸으로 나눈 표입니다. 카드를 누르면 과제를 확인하고 완료할 수 있어요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button to="/app/coach" variant="secondary">
            <IconSparkle className="size-[18px]" /> AI 코치와 만들기
          </Button>
          <Button onClick={() => navigate('/app/sheets/new')}>
            <IconPlus className="size-[18px]" /> 새로 만들기
          </Button>
        </div>
      </header>

      {sheets.loading && sheets.data.length === 0 ? (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <Skeleton className="h-[248px] w-full" />
            </li>
          ))}
        </ul>
      ) : sheets.error ? (
        <ErrorState message={sheets.error} onRetry={() => void reloadSheets()} />
      ) : sheets.data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="🧩"
            title="아직 만다라트가 없어요"
            body="목표 하나를 81칸으로 쪼개면 오늘 할 일이 생기고, 그만큼 마을에 건물이 세워집니다."
            action={<Button to="/app/sheets/new">첫 만다라트 만들기</Button>}
          />
        </div>
      ) : (
        <section aria-label="내 만다라트 목록">
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {sheets.data.map((sheet, i) => (
              <li key={sheet.id} className="animate-rise" style={{ animationDelay: `${i * 0.05}s` }}>
                <SheetCard
                  sheet={sheet}
                  detail={detailMap[sheet.id]}
                  onDelete={() => setTarget(sheet)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 친구가 공개한 만다라트 */}
      {friendSheets.length > 0 && (
        <section className="mt-4">
          <h2 className="section-title">친구의 공개 만다라트</h2>
          <p className="muted mt-1 text-[12.5px] font-semibold">
            친구가 공개한 표입니다. 보기만 할 수 있어요.
          </p>

          <ul className="m-0 mt-4 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {friendSheets.map(({ friend, sheet }) => (
              <li key={`${friend.userId}-${sheet.id}`}>
                <Link
                  to={`/app/friends/${friend.userId}/sheets/${sheet.id}`}
                  className="card flex items-center gap-4 p-4 no-underline transition-transform hover:-translate-y-1"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-2xl text-lg"
                    style={{ background: 'var(--surface-sunken)' }}
                  >
                    🧩
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="muted m-0 text-[11.5px] font-bold">{friend.name}</p>
                    <h3 className="m-0 mt-1 truncate text-[14px] font-extrabold">{sheet.title}</h3>
                    <p className="muted m-0 mt-1 text-[11px] font-semibold">
                      좋아요 {sheet.likeCount} · {formatDate(sheet.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="이 만다라트를 삭제할까요?"
        description={`"${target?.title ?? ''}" 와(과) 그 안의 과제 기록이 함께 사라집니다. 되돌릴 수 없어요.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTarget(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={async () => {
                if (!target) return
                setBusy(true)
                await deleteSheet(target.id)
                setBusy(false)
                setTarget(null)
              }}
            >
              {busy ? '삭제 중…' : '삭제하기'}
            </Button>
          </>
        }
      />
    </div>
  )
}
