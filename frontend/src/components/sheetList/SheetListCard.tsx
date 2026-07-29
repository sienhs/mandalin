import ProgressBar from '../common/ProgressBar'
import { cn } from '../../utils/cn'
import { TOTAL_GOALS } from './sheetList.data'
import type { SheetSummary } from './sheetList.types'
import { themeOfSheet, toDottedDate } from './sheetList.utils'

type SheetListCardProps = {
  sheet: SheetSummary
  onOpen: (sheetId: number) => void
  onRemove: (sheetId: number) => void
}

//목록 화면의 개인 만다라트 카드
export default function SheetListCard({ sheet, onOpen, onRemove }: SheetListCardProps) {
  const { sheetId, title, isOpen, achievementRate, createdAt, expiredAt } = sheet
  const theme = themeOfSheet(sheetId)

  return (
    <article className={cn('sheet-card', `sheet-card--${theme}`)}>
      <div className="sheet-card-thumb">
        <span className="sheet-card-badge">{isOpen ? '공개' : '비공개'}</span>
        <button
          type="button"
          onClick={() => onRemove(sheetId)}
          aria-label={`${title} 삭제`}
          className="sheet-card-remove"
        >
          ✕
        </button>
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
          <span className="sheet-card-percent">{achievementRate}%</span>
        </div>

        <ProgressBar value={achievementRate} label={`${title} 달성률`} className="mt-1.5" />
      </button>
    </article>
  )
}
