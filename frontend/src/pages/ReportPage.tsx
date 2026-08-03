import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../data/store'
import type { WeeklyReport } from '../data/types'
import Button from '../components/common/ActionButton'
import { Badge, EmptyState, ErrorState, ProgressBar, Skeleton, domainColor } from '../components/common/Primitives'

export default function Report() {
  const { gateway, details } = useStore()
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** 실천 기록이 하나도 없으면 리포트를 만들 수 없다 — 생성 버튼을 열어두면 빈 결과만 돌아온다. */
  const hasRecord = Object.values(details.data).some((s) =>
    (s.domains ?? []).some((d) => d.subjects.some((x) => x.tryCount > 0)),
  )

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setError(null)
      try {
        setReport(await gateway.weeklyReport(signal))
      } catch (cause) {
        if (signal?.aborted) return
        setError(cause instanceof Error ? cause.message : 'AI 리포트를 불러오지 못했습니다.')
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [gateway],
  )

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const create = async () => {
    setCreating(true)
    setError(null)
    try {
      // 사용자가 직접 누른 생성이라 화면을 떠나도 중단하지 않는다.
      setReport(await gateway.createReport())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'AI 리포트를 만들지 못했습니다.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">AI 리포트</h1>
          <p className="page-caption">
            지난 실천 기록을 모아 무엇이 잘 되고 어디서 멈췄는지 정리해 드려요.
          </p>
        </div>
        {report && (
          <Button variant="secondary" onClick={() => void create()} disabled={creating}>
            {creating ? '분석 중…' : '다시 분석하기'}
          </Button>
        )}
      </header>

      {loading || creating ? (
        <div className="flex flex-col gap-5">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="size-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <strong className="text-[14px] font-extrabold">
                {creating ? 'AI 가 이번 주 기록을 분석하고 있어요…' : '리포트를 불러오는 중이에요…'}
              </strong>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-28 w-full" />
            </div>
          </section>
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => void load()}
          hint="리포트 생성은 서버의 GEMINI_API_KEY 설정이 필요합니다. 비어 있으면 이 기능만 실패해요."
        />
      ) : !report ? (
        <div className="card">
          {hasRecord ? (
            <EmptyState
              icon="✨"
              title="이번 주 리포트를 만들 수 있어요"
              body="지금까지의 실천 기록을 AI 가 정리해 드립니다. 몇 초 걸려요."
              action={<Button onClick={() => void create()}>리포트 생성하기</Button>}
            />
          ) : (
            <EmptyState
              icon="📊"
              title="아직 분석할 기록이 없어요"
              body="과제를 한 번이라도 완료하면 그때부터 리포트를 만들 수 있습니다. 오늘 할 일을 하나만 체크해 보세요."
              action={<Button to="/app">오늘 할 일 보러 가기</Button>}
            />
          )}
        </div>
      ) : (
        <>
          <section
            className="relative overflow-hidden rounded-[22px] p-7 sm:p-9"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-800))',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10"
            />
            <span className="relative inline-flex rounded-full bg-white/20 px-3 py-1.5 text-[11.5px] font-extrabold text-white">
              이번 주 요약
            </span>
            <h2 className="relative m-0 mt-4 max-w-xl text-[clamp(20px,3vw,28px)] font-black leading-snug tracking-[-0.04em] text-white">
              {report.title}
            </h2>
            <p className="relative m-0 mt-3 max-w-lg text-[14px] font-semibold leading-relaxed text-white/80">
              {report.summary}
            </p>

            {report.metrics.length > 0 && (
              <dl className="relative mt-7 grid max-w-lg gap-4 sm:grid-cols-3">
                {report.metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl bg-white/[.14] px-4 py-3.5 backdrop-blur">
                    <dt className="text-[11.5px] font-bold text-white/70">{m.label}</dt>
                    <dd className="m-0 mt-1 text-lg font-black tracking-[-0.03em] text-white">
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="card p-6">
              <h2 className="section-title m-0 flex items-center gap-2">
                <span className="text-emerald-500">▲</span> 잘하고 있는 것
              </h2>
              {report.strengths.length === 0 ? (
                <p className="muted m-0 mt-4 text-[13px] font-semibold">아직 없어요.</p>
              ) : (
                <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
                  {report.strengths.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13.5px] font-semibold leading-relaxed">
                      <span aria-hidden="true" className="mt-0.5 text-emerald-500">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-6">
              <h2 className="section-title m-0 flex items-center gap-2">
                <span className="text-amber-500">▼</span> 이번 주에 챙길 것
              </h2>
              {report.improvements.length === 0 ? (
                <p className="muted m-0 mt-4 text-[13px] font-semibold">아직 없어요.</p>
              ) : (
                <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
                  {report.improvements.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13.5px] font-semibold leading-relaxed">
                      <span aria-hidden="true" className="mt-0.5 text-amber-500">
                        !
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {report.sheets.length > 0 && (
            <section className="card p-6">
              <h2 className="section-title m-0">만다라트별 달성률</h2>
              <div className="mt-5 flex flex-col gap-6">
                {report.sheets.map((s) => (
                  <article key={s.sheetId}>
                    <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-[14px] font-extrabold">{s.title}</strong>
                        <Badge>
                          {s.completedCount}/{s.targetCount}개 완료
                        </Badge>
                      </div>
                      <strong className="text-[15px] font-black tabular-nums">
                        {s.achievementRate}%
                      </strong>
                    </div>
                    <ProgressBar value={s.achievementRate} label={`${s.title} 달성률`} />

                    {s.domains.length > 0 && (
                      <ul className="m-0 mt-3.5 grid list-none gap-x-5 gap-y-2.5 p-0 sm:grid-cols-2">
                        {s.domains.map((d, i) => (
                          <li key={d.label} className="flex items-center gap-2.5">
                            <span
                              className="size-2.5 shrink-0 rounded-sm"
                              style={{ background: domainColor(i) }}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold">
                              {d.label}
                            </span>
                            <span className="muted shrink-0 text-[12px] font-black tabular-nums">
                              {d.value}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
