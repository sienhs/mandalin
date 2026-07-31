import ProgressBar from '../common/ProgressBar'
import { cn } from '../../utils/cn'
import { TOTAL_GOALS } from './sheetList.data'
import type { SheetSummary } from './sheetList.types'
import { themeOfSheet, toDottedDate } from './sheetList.utils'

type SheetListCardProps = {
  sheet: SheetSummary
  /**
   * 달성률 0~100. 목록 응답이 아니라 시트별 상세에서 계산한 값이라 따로 받는다.
   * 아직 도착하지 않았으면 null.
   */
  achievementRate: number | null
  onOpen: (sheetId: number) => void
  /** 삭제(X) 버튼. 넘기지 않으면 버튼이 없다 — 남의 만다라트는 지울 수 없다. */
  onRemove?: (sheetId: number) => void
}

//목록 화면의 개인 만다라트 카드
export default function SheetListCard({
  sheet,
  achievementRate,
  onOpen,
  onRemove,
}: SheetListCardProps) {
  const { sheetId, title, isOpen, createdAt, expiredAt } = sheet
  const theme = themeOfSheet(sheetId)

  return (
    <article className={cn('sheet-card', `sheet-card--${theme}`)}>
      <div className="sheet-card-thumb">
        <span className="sheet-card-badge">{isOpen ? '공개' : '비공개'}</span>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(sheetId)}
            aria-label={`${title} 삭제`}
            className="sheet-card-remove"
          >
            ✕
          </button>
        )}
        <span className="sheet-card-emoji" aria-hidden="true">
          🏙️
        </span>
      </div>

      {/* 카드 본문 전체가 상세로 가는 버튼 */}
      <button
        type="button"
        onClick={() => onOpen(sheetId)}
        className="sheet-card-body cursor-pointer border-0 bg-transparent text-left"
      >
        <h3 className="sheet-card-title">{title}</h3>
        <p className="sheet-card-period">
          {toDottedDate(createdAt)}~{toDottedDate(expiredAt)}
        </p>

        <div className="sheet-card-meta">
          <span className="sheet-card-goals">총 {TOTAL_GOALS}개 목표</span>
          {/* 달성률이 아직 오지 않은 동안은 자리만 잡아둔다 — 0% 로 보여주면 오해를 준다. */}
          <span className="sheet-card-percent">
            {achievementRate === null ? '—%' : `${achievementRate}%`}
          </span>
        </div>

        <ProgressBar
          value={achievementRate ?? 0}
          label={`${title} 달성률`}
          className="mt-1.5"
        />
      </button>
    </article>
  )
}
