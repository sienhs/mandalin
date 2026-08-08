import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import Button from '../components/common/ActionButton'
import { UuidChip } from '../components/common/UuidChip'
import Modal from '../components/common/Modal'
import {
  Avatar,
  Badge,
  Field,
  Input,
  ProgressBar,
  Segmented,
  Skeleton,
} from '../components/common/Primitives'
import { IconGrid, IconShop, IconVillage } from '../components/common/Icons'
import { formatDate, fromNow, num } from '../utils/format'
import type { PointLog } from '../data/types'
import { cn } from '../utils/cn'

export default function Profile() {
  const {
    user,
    details,
    shop,
    sheets,
    theme,
    toggleTheme,
    logout,
    updateName,
    mode,
    resetMockData,
    gateway,
  } = useStore()
  const navigate = useNavigate()

  const [nickOpen, setNickOpen] = useState(false)
  const [draft, setDraft] = useState(user?.name ?? '')
  const [busy, setBusy] = useState(false)

  /** 포인트 적립 내역. 페이지 단위라 이 화면에서만 따로 받는다. */
  const [page, setPage] = useState(0)
  const [history, setHistory] = useState<{
    logs: PointLog[]
    totalPages: number
    currentPoint: number
  }>({ logs: [], totalPages: 1, currentPoint: 0 })
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setHistoryLoading(true)
    gateway
      .pointHistory(page)
      .then((res) => {
        if (alive) setHistory(res)
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setHistoryLoading(false)
      })
    return () => {
      alive = false
    }
  }, [gateway, page])

  const stats = useMemo(() => {
    const subjects = Object.values(details.data).flatMap(
      (s) => s.domains?.flatMap((d) => d.subjects) ?? [],
    )
    const tried = subjects.reduce((acc, s) => acc + s.tryCount, 0)
    const completed = subjects.filter((s) => s.isDone).length
    const owned = shop.data.filter((i) => i.owned).length
    const rate =
      subjects.length === 0
        ? 0
        : Math.round(subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length)
    return { tried, completed, owned, rate, total: subjects.length }
  }, [details.data, shop.data])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="page-title">마이페이지</h1>
        <p className="page-caption">누적 기록과 계정 설정을 확인할 수 있어요.</p>
      </header>

      <section className="card flex flex-wrap items-center gap-5 p-6">
        <Avatar name={user?.name} imageUrl={user?.profileImageUrl ?? null} size={64} ring />
        <div className="min-w-[180px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-lg font-extrabold tracking-[-0.03em]">
              {user?.name ?? '—'}님
            </strong>
            {mode === 'mock' && <Badge tone="brand">목업 계정</Badge>}
          </div>
          <p className="muted m-0 mt-1.5 text-[12.5px] font-semibold">
            {user?.createdAt ? `${formatDate(user.createdAt)}부터 함께하고 있어요` : ''}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setDraft(user?.name ?? '')
            setNickOpen(true)
          }}
        >
          닉네임 변경
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '누적 실천 횟수', value: num(stats.tried), suffix: '회', brand: true },
          { label: '완료한 과제', value: num(stats.completed), suffix: `/ ${stats.total}개` },
          { label: '보유 건물', value: num(stats.owned), suffix: `/ ${shop.data.length}종` },
          { label: '전체 달성률', value: `${stats.rate}`, suffix: '%' },
        ].map((card, i) => (
          <article key={card.label} className="card p-5">
            <p className="muted m-0 text-[12px] font-bold">{card.label}</p>
            <p className="m-0 mt-2 flex items-baseline gap-1">
              <strong
                className={cn(
                  'text-2xl font-black tracking-[-0.04em]',
                  card.brand && 'text-brand-600 dark:text-brand-400',
                )}
              >
                {card.value}
              </strong>
              <span className="muted text-[12.5px] font-bold">{card.suffix}</span>
            </p>
            {i === 3 && (
              <div className="mt-3">
                <ProgressBar value={stats.rate} label="전체 달성률" size="sm" />
              </div>
            )}
          </article>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title m-0">내 만다라트</h2>
            <strong className="text-lg font-black text-brand-600 dark:text-brand-400">
              {num(user?.point ?? 0)}P
            </strong>
          </div>

          {sheets.data.length === 0 ? (
            <p className="muted m-0 mt-4 text-[12.5px] font-semibold">아직 만든 표가 없어요.</p>
          ) : (
            <ul className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
              {sheets.data.map((s) => {
                const detail = details.data[s.id]
                const rate = detail?.progress ?? detail?.achievementRate ?? s.progress ?? s.achievementRate ?? 0
                return (
                  <li key={s.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <Link
                        to={`/app/sheets/${s.id}`}
                        className="truncate text-[13.5px] font-bold no-underline hover:text-brand-600"
                      >
                        {s.title}
                      </Link>
                      <span className="shrink-0 text-[12px] font-black tabular-nums">
                        {rate}%
                      </span>
                    </div>
                    <ProgressBar value={rate} size="sm" label={`${s.title} 달성률`} />
                  </li>
                )
              })}
            </ul>
          )}

          {/* ───────── 포인트 적립 내역 ───────── */}
          <div className="mt-7 border-t pt-6" style={{ borderColor: 'var(--border-hairline)' }}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="section-title m-0 text-[14px]">포인트 적립 내역</h3>
              {history.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 0 || historyLoading}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="muted grid size-7 place-items-center rounded-lg text-[12px] font-bold disabled:opacity-40"
                    style={{ background: 'var(--surface-sunken)' }}
                    aria-label="이전 페이지"
                  >
                    ‹
                  </button>
                  <span className="muted px-1 text-[11.5px] font-bold tabular-nums">
                    {page + 1}/{history.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= history.totalPages - 1 || historyLoading}
                    onClick={() => setPage((p) => p + 1)}
                    className="muted grid size-7 place-items-center rounded-lg text-[12px] font-bold disabled:opacity-40"
                    style={{ background: 'var(--surface-sunken)' }}
                    aria-label="다음 페이지"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {historyLoading && history.logs.length === 0 ? (
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : history.logs.length === 0 ? (
              <p className="muted m-0 mt-3 text-[12.5px] font-semibold">
                아직 적립 내역이 없어요. 과제를 하나 완료하면 여기에 남습니다.
              </p>
            ) : (
              <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                {history.logs.map((log) => (
                  <li
                    key={log.logId}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                    style={{ background: 'var(--surface-sunken)' }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold">
                        {log.subjectTitle}
                      </span>
                      <span className="muted mt-0.5 block text-[11px] font-semibold">
                        {log.domainTitle} · {fromNow(log.createdAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-black tabular-nums text-brand-600 dark:text-brand-400">
                      +{num(log.earnedPoint)}P
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="card p-6">
            <h2 className="section-title m-0 mb-4">바로가기</h2>
            <div className="flex flex-col gap-2">
              {[
                {
                  to: '/app/sheets',
                  icon: IconGrid,
                  title: '내 만다라트 목록',
                  body: `${sheets.data.length}개의 표`,
                },
                { to: '/app/village', icon: IconVillage, title: '내 마을', body: '도시 보기' },
                {
                  to: '/app/shop',
                  icon: IconShop,
                  title: '상점',
                  body: `${stats.owned}/${shop.data.length}종 보유`,
                },
              ].map(({ to, icon: Icon, title, body }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 no-underline transition-colors hover:brightness-95"
                  style={{ background: 'var(--surface-sunken)' }}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="min-w-0 text-left">
                    <span className="block text-[13.5px] font-extrabold">{title}</span>
                    <span className="muted block text-[11.5px] font-semibold">{body}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/*
            예전에는 점선 박스(p-4) + 전체폭 복사 버튼으로 세로 100px 넘게 썼다.
            36자짜리 문자열 하나를 보여 주는 데 카드 하나를 통째로 쓸 이유가 없다 —
            복사해 붙여넣는 값이라 눈으로 다 읽을 필요도 없다.
          */}
          <section className="card p-6">
            <h2 className="section-title m-0 mb-3">내 UUID</h2>
            <UuidChip size="md" />
            <p className="muted m-0 mt-2.5 text-[11.5px] font-medium leading-relaxed">
              친구에게 이 값을 알려 주면 친구 요청을 보낼 수 있어요.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="section-title m-0 mb-4">설정</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] font-bold">화면 테마</span>
                <Segmented
                  size="sm"
                  value={theme}
                  onChange={(v) => {
                    if (v !== theme) toggleTheme()
                  }}
                  options={[
                    { value: 'light', label: '밝게' },
                    { value: 'dark', label: '어둡게' },
                  ]}
                />
              </div>

              {/*
                데이터 출처(목업/서버) 토글이 여기 있었다. 세션 도중에 뒤집으면 이미 그려진
                화면은 그대로라 절반은 서버 것, 절반은 브라우저 것을 보게 된다. 출처는 이제
                로그인할 때만 정해진다(`store.tsx` 의 `initialMode` 주석). 지금 어느 쪽인지는
                위쪽 이름 옆 '목업 계정' 배지로 읽는다.
              */}

              <div className="border-t pt-4" style={{ borderColor: 'var(--border-hairline)' }}>
                {mode === 'mock' && (
                  <Button variant="secondary" size="sm" full onClick={resetMockData}>
                    목업 데이터 초기화
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  full
                  className="mt-2"
                  onClick={async () => {
                    await logout()
                    navigate('/')
                  }}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={nickOpen}
        onClose={() => setNickOpen(false)}
        title="닉네임 변경"
        description="1~20자까지 쓸 수 있어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setNickOpen(false)}>
              취소
            </Button>
            <Button
              size="sm"
              disabled={!draft.trim() || busy}
              onClick={async () => {
                setBusy(true)
                const ok = await updateName(draft.trim())
                setBusy(false)
                if (ok) setNickOpen(false)
              }}
            >
              {busy ? '저장 중…' : '저장'}
            </Button>
          </>
        }
      >
        <Field label="닉네임">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={20} />
        </Field>
      </Modal>
    </div>
  )
}
