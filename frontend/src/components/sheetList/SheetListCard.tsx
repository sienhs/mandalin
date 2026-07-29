import ProgressBar from '../common/ProgressBar'
import { cn } from '../../utils/cn'
import type { SheetSummary } from './sheetList.types'

/** 'YYYY-MM-DD' → 'YYYY.MM.DD' */
const toDotted = (date: string) => date.replaceAll('-', '.')

type SheetListCardProps = {
  sheet: SheetSummary
  onOpen: (id: number) => void
  onRemove: (id: number) => void
}

/** 목록 화면의 개인 만다라트 카드: 썸네일 · 제목 · 기간 · 달성률 */
export default function SheetListCard({ sheet, onOpen, onRemove }: SheetListCardProps) {
  const { id, title, isOpen, startDate, endDate, totalGoals, achievementRate, theme } = sheet

  return (
    <article className={cn('sheet-card', `sheet-card--${theme}`)}>
      <div className="sheet-card-thumb">
        <span className="sheet-card-badge">{isOpen ? '공개' : '비공개'}</span>
        <button
          type="button"
          onClick={() => onRemove(id)}
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
        onClick={() => onOpen(id)}
        className="sheet-card-body cursor-pointer border-0 bg-transparent text-left"
      >
        <h3 className="sheet-card-title">{title}</h3>
        <p className="sheet-card-period">
          {toDotted(startDate)}~{toDotted(endDate)}
        </p>

        <div className="sheet-card-meta">
          <span className="sheet-card-goals">총 {totalGoals}개 목표</span>
          <span className="sheet-card-percent">{achievementRate}%</span>
        </div>

        <ProgressBar value={achievementRate} label={`${title} 달성률`} className="mt-1.5" />
      </button>
    </article>
  )
}
