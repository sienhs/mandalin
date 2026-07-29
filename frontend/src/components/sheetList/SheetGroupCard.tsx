import type { GroupSheetSummary } from './sheetList.types'

type SheetGroupCardProps = {
  group: GroupSheetSummary
  onMove: (id: number) => void
}

/** 목록 화면의 그룹 만다라트 카드: 아이콘 · 제목 · 진행 바 · 달성률 · 이동 */
export default function SheetGroupCard({ group, onMove }: SheetGroupCardProps) {
  const { id, title, totalGoals, doneGoals, memberCount, achievementRate } = group

  return (
    <article className="sheet-group-card">
      <span className="sheet-group-icon" aria-hidden="true">
        👥
      </span>

      <div className="sheet-group-main">
        <h3 className="sheet-group-title">{title}</h3>
        <p className="sheet-group-sub">
          {totalGoals}개 목표 중 {doneGoals}개-멤버 {memberCount}명
        </p>
        <div
          className="sheet-progress-track max-w-[520px]"
          role="progressbar"
          aria-valuenow={achievementRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${title} 달성률`}
        >
          <div className="sheet-progress-fill" style={{ width: `${achievementRate}%` }} />
        </div>
      </div>

      <span className="sheet-group-percent">{achievementRate}%</span>

      <button
        type="button"
        onClick={() => onMove(id)}
        className="sheet-list-btn sheet-list-btn-ghost shrink-0"
      >
        이동
      </button>
    </article>
  )
}
