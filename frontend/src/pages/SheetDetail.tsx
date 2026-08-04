import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { domainProgress, filledCells, useSheetDetail, useStore } from '../data/store'
import { PERIOD_LABEL, type Period, type Subject } from '../data/types'
import MandalartGrid, { type CellRef } from '../features/sheet/MandalartGrid'
import Button from '../components/common/ActionButton'
import { IconCheck, IconHeart, IconVillage } from '../components/common/Icons'
import {
  Badge,
  EmptyState,
  ErrorState,
  ProgressBar,
  ProgressRing,
  Segmented,
  Skeleton,
  domainColor,
} from '../components/common/Primitives'
import { formatDate } from '../utils/format'
import { cn } from '../utils/cn'

type Props = { readOnly?: boolean }

/**
 * 왜 더 못 누르는지 한 줄로 말해 준다.
 *
 * <p>예전에는 이유를 아무도 말하지 않았다. 오늘 이미 한 과제도 버튼이 그대로 열려 있어서
 * 눌러 보면 아무 일도 일어나지 않았고(서버가 하루 한 번만 인정한다), 사용자는 고장으로 읽었다.
 * 주기마다 "다시 열리는 시점"이 달라서 문구도 주기별로 갈라 준다.
 */
function lockedReason(sub: Subject): string | null {
  if (sub.canExecute) return null
  if (sub.isDone) return '목표를 다 채운 과제입니다'

  const byPeriod: Record<Period, string> = {
    DAILY: '오늘 이미 수행한 과제입니다',
    WEEKLY: '이번 주에 목표 횟수를 채웠어요',
    MONTHLY: '이번 달에 목표 횟수를 채웠어요',
    NONE: '이미 수행한 과제입니다',
  }

  // 오늘 눌렀는데 주기 목표는 아직 남은 경우(예: 주 3회 중 1회) — 날이 바뀌면 또 할 수 있다.
  if (sub.isDoneToday && !sub.isDonePeriod) return '오늘 이미 수행한 과제입니다'
  return byPeriod[sub.period]
}

export default function SheetDetail({ readOnly = false }: Props) {
  const { sheetId } = useParams()
  const navigate = useNavigate()
  const { completeSubjects, toggleLike, setVisibility } = useStore()
  const { sheet, loading, error, reload, setSheet } = useSheetDetail(Number(sheetId))

  const [selected, setSelected] = useState<CellRef | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  /** 요청이 날아가는 중인지. 상태보다 먼저 바뀌어야 연타를 막을 수 있다. */
  const inFlight = useRef(false)

  useEffect(() => {
    if (sheet && !selected) setSelected({ kind: 'domain', domainIndex: 0 })
  }, [sheet, selected])

  if (loading && !sheet) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[124px] w-full" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !sheet) {
    return (
      <ErrorState
        message={error ?? '만다라트를 찾을 수 없습니다.'}
        onRetry={() => void reload()}
        hint={
          <>
            비공개 시트는 소유자만 볼 수 있습니다.{' '}
            <Link to="/app/sheets" className="font-bold text-brand-600">
              목록으로 돌아가기
            </Link>
          </>
        }
      />
    )
  }

  const domains = sheet.domains ?? []
  const byPosition = new Map(domains.map((d) => [d.position, d]))
  const selectedDomain =
    selected && selected.kind !== 'core' ? byPosition.get(selected.domainIndex) : undefined

  /**
   * 과제 한 번 완료.
   *
   * <p><b>왜 ref 로 한 번 더 막는가.</b> `pending` 상태만으로 막으면 버튼이 잠기는 건 다음
   * 렌더부터다. 빠르게 두 번 누르면 두 클릭이 같은 렌더에서 처리돼 요청이 두 번 나갔다.
   * ref 는 그 자리에서 바뀌므로 두 번째 클릭이 즉시 걸러진다.
   */
  const complete = async (subjectId: number) => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(subjectId)
    try {
      const ok = await completeSubjects(sheet.id, [subjectId])
      if (ok) await reload()
    } finally {
      inFlight.current = false
      setPending(null)
    }
  }

  const like = async () => {
    const res = await toggleLike(sheet.id)
    if (res) setSheet({ ...sheet, isLiked: res.isLiked, likeCount: res.likeCount })
  }

  const changeVisibility = async (isOpen: boolean) => {
    if (isOpen === sheet.isOpen) return
    // 눈에 먼저 반영하고, 실패하면 되돌린다.
    setSheet({ ...sheet, isOpen })
    const ok = await setVisibility(sheet.id, isOpen)
    if (!ok) setSheet({ ...sheet, isOpen: !isOpen })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ───────── 헤더 ───────── */}
      <header className="card flex flex-wrap items-center gap-5 p-6">
        <ProgressRing value={sheet.achievementRate} size={84}>
          <strong className="text-lg font-black tracking-[-0.04em]">
            {sheet.achievementRate}%
          </strong>
        </ProgressRing>

        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {readOnly ? (
              <Badge>읽기 전용 · 친구의 만다라트</Badge>
            ) : (
              <Badge tone={sheet.isOpen ? 'brand' : 'neutral'}>
                {sheet.isOpen ? '공개' : '비공개'}
              </Badge>
            )}
            <Badge>{filledCells(sheet)}/81칸</Badge>
          </div>

          <h1 className="page-title mt-2">{sheet.title}</h1>
          <p className="page-caption">
            {formatDate(sheet.createdAt)} – {formatDate(sheet.expiredAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void like()}
            className={cn(
              'flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-colors',
              sheet.isLiked && 'border-rose-400/40 bg-rose-500/10 text-rose-500',
            )}
            style={sheet.isLiked ? undefined : { borderColor: 'var(--border-hairline)' }}
            aria-pressed={sheet.isLiked}
          >
            <IconHeart className="size-[16px]" />
            {sheet.likeCount}
          </button>

          {readOnly ? (
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              돌아가기
            </Button>
          ) : (
            <>
              {/* 내용은 못 고쳐도 공개 여부는 바꿀 수 있다 — 목표가 아니라 노출 설정이라서 */}
              <Segmented
                size="sm"
                value={sheet.isOpen ? 'public' : 'private'}
                onChange={(v) => void changeVisibility(v === 'public')}
                options={[
                  { value: 'public', label: '공개' },
                  { value: 'private', label: '비공개' },
                ]}
              />
              <Button
                size="sm"
                to={`/app/village?sheet=${sheet.id}`}
                state={{ from: `/app/sheets/${sheet.id}` }}
              >
                <IconVillage className="size-[18px]" /> 마을에서 보기
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        {/* ───────── 9x9 ───────── */}
        <section className="card p-4 sm:p-6">
          <MandalartGrid sheet={sheet} selected={selected} onSelect={setSelected} />

          <div
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-[11.5px] font-bold"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span className="muted">칸 색이 아래에서 차오르면 그만큼 진행된 것입니다</span>
            <span className="ml-auto flex flex-wrap items-center gap-3">
              {domains.slice(0, 4).map((d) => (
                <span key={d.id} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ background: domainColor(d.position) }}
                    aria-hidden="true"
                  />
                  {domainProgress(d.subjects)}%
                </span>
              ))}
            </span>
          </div>
        </section>

        {/* ───────── 선택 패널 ───────── */}
        <aside className="flex flex-col gap-5">
          {selected?.kind === 'core' && (
            <section className="card p-6">
              <Badge tone="brand">핵심 목표</Badge>
              <h2 className="m-0 mt-3 text-xl font-extrabold tracking-[-0.03em]">{sheet.title}</h2>
              <p className="muted m-0 mt-2 text-[13px] font-medium leading-relaxed">
                이 목표를 8개의 세부 목표로 나눴고, 각 세부 목표마다 실천 과제를 두었습니다.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelected({ kind: 'domain', domainIndex: d.position })}
                    className="flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:brightness-[.98]"
                    style={{ background: 'var(--surface-sunken)' }}
                  >
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: domainColor(d.position) }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold">
                      {d.title || `세부 목표 ${d.position + 1}`}
                    </span>
                    <span className="shrink-0 text-[12px] font-black tabular-nums">
                      {domainProgress(d.subjects)}%
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selected && selected.kind !== 'core' && selectedDomain && (
            <section className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-white"
                    style={{ background: domainColor(selectedDomain.position) }}
                  >
                    세부 목표 {selectedDomain.position + 1}
                  </span>
                  <h2 className="m-0 mt-2.5 text-[17px] font-extrabold tracking-[-0.03em]">
                    {selectedDomain.title || '(제목 없음)'}
                  </h2>
                </div>
                <strong className="shrink-0 text-lg font-black tabular-nums">
                  {domainProgress(selectedDomain.subjects)}%
                </strong>
              </div>

              <div className="mt-3">
                <ProgressBar
                  value={domainProgress(selectedDomain.subjects)}
                  color={domainColor(selectedDomain.position)}
                  label={`${selectedDomain.title} 진행률`}
                />
              </div>

              <div className="mt-5">
                <p className="muted m-0 mb-2.5 text-[12.5px] font-bold">
                  실천 과제 {selectedDomain.subjects.length}/8
                </p>

                {selectedDomain.subjects.length === 0 ? (
                  <div
                    className="rounded-xl px-4 py-6 text-center"
                    style={{ background: 'var(--surface-sunken)' }}
                  >
                    <p className="muted m-0 text-[12.5px] font-semibold">
                      이 세부 목표에는 과제가 없어요.
                    </p>
                  </div>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {selectedDomain.subjects.map((sub, j) => {
                      const active = selected.kind === 'subject' && selected.subjectIndex === j
                      const busy = pending === sub.id
                      const locked = lockedReason(sub)

                      return (
                        <li key={sub.id}>
                          <div
                            className={cn(
                              'rounded-2xl p-3 transition-all',
                              active && 'ring-2 ring-brand-400/60',
                            )}
                            style={{ background: 'var(--surface-sunken)' }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelected({
                                  kind: 'subject',
                                  domainIndex: selectedDomain.position,
                                  subjectIndex: j,
                                })
                              }
                              className="flex w-full items-start gap-2.5 text-left"
                            >
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    'block text-[13.5px] font-bold',
                                    sub.isDone && 'line-through opacity-60',
                                  )}
                                >
                                  {sub.title}
                                </span>
                                <span className="muted mt-1 block text-[11.5px] font-semibold">
                                  {PERIOD_LABEL[sub.period]} · {sub.tryCount}/{sub.targetCount}회
                                  {sub.isDone && ' · 완료'}
                                </span>
                              </span>
                              <span className="shrink-0 text-[12px] font-black tabular-nums">
                                {sub.progress}%
                              </span>
                            </button>

                            {/*
                              진행 막대와 완료 버튼을 한 줄에 둔다. 예전에는 버튼이 <b>선택한
                              과제에만</b> 전체 폭으로 나타나서, 다른 과제를 완료하려면 먼저
                              그 줄을 눌러 선택해야 했다. 작은 버튼을 오른쪽에 항상 두면
                              곧바로 누를 수 있고 줄 높이도 늘지 않는다.
                            */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <span className="min-w-0 flex-1">
                                <ProgressBar
                                  value={sub.progress}
                                  size="sm"
                                  color={domainColor(selectedDomain.position)}
                                  label={`${sub.title} 진행률`}
                                />
                              </span>

                              {!readOnly && (
                                <Button
                                  size="xs"
                                  variant={locked ? 'quiet' : 'primary'}
                                  className="shrink-0"
                                  disabled={Boolean(locked) || busy}
                                  /* 잠긴 이유는 툴팁으로도 남긴다 — 아래 안내가 접혀도 읽을 수 있게. */
                                  title={locked ?? `한 번 완료하면 ${sub.point}P 를 받습니다`}
                                  onClick={() => void complete(sub.id)}
                                >
                                  <IconCheck className="size-3.5" />
                                  {busy ? '저장 중…' : locked ? '완료' : `한 번 완료 +${sub.point}P`}
                                </Button>
                              )}
                            </div>

                            {/* 왜 못 누르는지 그 자리에서 말해 준다. */}
                            {!readOnly && locked && (
                              <p className="m-0 mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                <IconCheck className="size-3.5 shrink-0" />
                                {locked}
                              </p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {domains.length === 0 && (
        <div className="card">
          <EmptyState
            icon="📄"
            title="이 만다라트에는 아직 내용이 없어요"
            body="세부 목표와 과제가 비어 있습니다."
          />
        </div>
      )}
    </div>
  )
}
