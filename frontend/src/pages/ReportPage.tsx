import { useEffect, useState, type CSSProperties } from 'react'
import Header from '../components/common/Header'
import ProgressBar from '../components/common/ProgressBar'
import { REPORTS } from '../components/report/report.data'
import type { ReportPeriod, ReportProgress } from '../components/report/report.types'
import { cn } from '../utils/cn'
import '../styles/report.css'

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  weekly: '주간',
  monthly: '월간',
}

function ReportProgressList({ rows }: { rows: ReportProgress[] }) {
  return (
    <div className="report-progress-list">
      {rows.map((row) => (
        <div
          key={row.label}
          className="report-progress-row"
          style={{ '--progress-accent': row.color } as CSSProperties}
        >
          <div className="report-progress-label">
            <span>{row.label}</span>
            <strong style={{ color: row.color }}>{row.value}%</strong>
          </div>
          <ProgressBar
            value={row.value}
            label={`${row.label} ${row.value}%`}
            className="report-progress"
          />
        </div>
      ))}
    </div>
  )
}

function ReportLoading() {
  return (
    <div className="report-loading" role="status" aria-live="polite">
      <div className="report-loading-card">
        <span className="report-spinner" aria-hidden="true" />
        <strong>리포트를 만드는 중이에요...</strong>
        <p>완료되면 리포트로 이동할게요</p>
        <div className="report-loading-track">
          <span />
        </div>
        <div className="report-loading-labels">
          <span>분석 중</span>
          <span>100%</span>
        </div>
      </div>

      <div className="report-skeleton report-skeleton-summary">
        <div>
          <i />
          <i />
          <i />
        </div>
        <div className="report-skeleton-metrics">
          <i />
          <i />
        </div>
      </div>
      <div className="report-skeleton-grid">
        <div className="report-skeleton"><i /><b /></div>
        <div className="report-skeleton"><i /><b /></div>
      </div>
    </div>
  )
}

/** 주간·월간 AI 성과 리포트 화면. */
export default function ReportPage() {
  const [period, setPeriod] = useState<ReportPeriod>('weekly')
  const [isLoading, setIsLoading] = useState(true)
  const report = REPORTS[period]

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 700)
    return () => window.clearTimeout(timer)
  }, [period])

  const changePeriod = (nextPeriod: ReportPeriod) => {
    if (nextPeriod === period) return
    setIsLoading(true)
    setPeriod(nextPeriod)
  }

  return (
    <div className="report-page">
      <Header />
      <main className="report-main" data-period={period}>
        <header className="report-heading">
          <div className="report-title">
            <div>
              <p>나의 성장 데이터</p>
              <h1>AI 리포트</h1>
            </div>
          </div>
          <div className="report-period-tabs" role="tablist" aria-label="리포트 기간">
            {(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={period === item}
                onClick={() => changePeriod(item)}
                className={cn(period === item && 'is-active')}
              >
                {PERIOD_LABELS[item]}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <ReportLoading />
        ) : (
          <div className="report-content">
            <section className={cn('report-summary', `is-${period}`)}>
              <div className="report-summary-copy">
                <span>{report.eyebrow}</span>
                <h2>{report.title}</h2>
                <p>{report.summary}</p>
              </div>
              <div className="report-metrics">
                {report.metrics.map((metric) => (
                  <article key={metric.label}>
                    <strong className={`is-${metric.tone}`}>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </article>
                ))}
              </div>
            </section>

            <div className="report-insights">
              <section>
                <h2 className="is-strength">{report.strengthTitle}</h2>
                {report.strengths.map((item) => (
                  <p key={item}>
                    <span aria-hidden="true">✓</span>
                    {item}
                  </p>
                ))}
              </section>
              <section>
                <h2 className="is-improvement">{report.improvementTitle}</h2>
                {report.improvements.map((item) => (
                  <p key={item}>
                    <span aria-hidden="true">!</span>
                    {item}
                  </p>
                ))}
              </section>
            </div>

            {report.trends && report.trendTitle && (
              <section className="report-chart">
                <h2>{report.trendTitle}</h2>
                <ReportProgressList rows={report.trends} />
              </section>
            )}

            <section className="report-chart">
              <h2>{report.categoryTitle}</h2>
              <ReportProgressList rows={report.categories} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
