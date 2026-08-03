import { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import ProgressBar from '../components/common/ProgressBar'
import { createAiReport, fetchAiReport } from '../components/report/report.api'
import type {
  AiReport,
  ReportProgress,
  ReportSheet,
} from '../components/report/report.types'
import '../styles/report.css'

function ReportProgressList({ rows }: { rows: ReportProgress[] }) {
  return (
    <div className="report-progress-list">
      {rows.map((row) => (
        <div key={row.label} className="report-progress-row">
          <div className="report-progress-label">
            <span>{row.label}</span>
            <strong>{row.value}%</strong>
          </div>
          <ProgressBar
            value={row.value}
            label={`${row.label} ${row.value}%`}
            className="report-progress"
            animated
          />
        </div>
      ))}
    </div>
  )
}

/** 시트 한 장의 달성률과, 그 아래 도메인별 달성률. */
function ReportSheetList({ sheets }: { sheets: ReportSheet[] }) {
  if (sheets.length === 0) {
    return <p className="report-sheet-empty">아직 집계할 시트가 없어요.</p>
  }

  return (
    <div className="report-sheet-list">
      {sheets.map((sheet) => (
        <article key={sheet.id} className="report-sheet">
          <div className="report-sheet-head">
            <strong>{sheet.title}</strong>
            {sheet.caption && <span>{sheet.caption}</span>}
            <b>{sheet.value}%</b>
          </div>
          <ProgressBar
            value={sheet.value}
            label={`${sheet.title} ${sheet.value}%`}
            className="report-progress"
            animated
          />
          {sheet.domains.length > 0 && (
            <div className="report-sheet-domains">
              <ReportProgressList rows={sheet.domains} />
            </div>
          )}
        </article>
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

/** 주간 AI 성과 리포트 화면. */
export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [report, setReport] = useState<AiReport | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setIsLoading(true)
    setReport(null)
    setReportError(null)

    fetchAiReport(controller.signal)
      .then(setReport)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setReportError(
          cause instanceof Error ? cause.message : 'AI 리포트를 불러오지 못했습니다.',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [reloadKey])

  /** 사용자가 직접 누른 생성이라 조회와 달리 화면을 떠나도 중단하지 않는다. */
  const generateReport = () => {
    setIsCreating(true)
    setReportError(null)

    createAiReport()
      .then(setReport)
      .catch((cause: unknown) => {
        setReportError(
          cause instanceof Error ? cause.message : 'AI 리포트를 만들지 못했습니다.',
        )
      })
      .finally(() => setIsCreating(false))
  }

  return (
    <div className="report-page">
      <Header />
      <main className="report-main">
        <header className="report-heading">
          <div className="report-title">
            <div>
              <p>나의 성장 데이터</p>
              <h1>AI 리포트</h1>
            </div>
          </div>
        </header>

        {isLoading || isCreating ? (
          <ReportLoading />
        ) : reportError ? (
          <section className="report-error" role="alert">
            <strong>리포트를 불러오지 못했어요</strong>
            <p>{reportError}</p>
            <button type="button" onClick={() => setReloadKey((current) => current + 1)}>
              다시 시도
            </button>
          </section>
        ) : report ? (
          <div className="report-content">
            <section className="report-summary">
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

            <section className="report-chart">
              <h2>{report.sheetTitle}</h2>
              <ReportSheetList sheets={report.sheets} />
            </section>
          </div>
        ) : (
          <section className="report-empty">
            <strong>아직 이번 주 리포트가 없어요</strong>
            <p>지난주 실천 기록을 모아 AI가 리포트를 만들어 드릴게요.</p>
            <button type="button" onClick={generateReport}>
              리포트 생성
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
