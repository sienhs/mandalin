import ProgressBar from '../common/ProgressBar'
import { TOTAL_GOALS } from './sheetList.data'
import type { GroupSheetSummary } from './sheetList.types'

type SheetGroupCardProps = {
  group: GroupSheetSummary
  onMove: (groupId: number) => void
}

/** 목록 화면의 그룹 만다라트 카드: 아이콘 · 제목 · 진행 바 · 달성률 · 이동 */
export default function SheetGroupCard({ group, onMove }: SheetGroupCardProps) {
  const { groupId, groupTitle, doneGoals, memberCount, achievementRate } = group

  return (
    <article className="sheet-group-card">
      <div className="sheet-group-main">
        <h3 className="sheet-group-title">{groupTitle}</h3>
        <p className="sheet-group-sub">
          {TOTAL_GOALS}개 목표 중 {doneGoals}개-멤버 {memberCount}명
        </p>
        <ProgressBar
          value={achievementRate}
          label={`${groupTitle} 달성률`}
          className="mt-1.5 max-w-[520px]"
        />
      </div>

      <span className="sheet-group-percent">{achievementRate}%</span>

      <button
        type="button"
        onClick={() => onMove(groupId)}
        className="sheet-list-btn-lavender shrink-0"
      >
        이동
      </button>
    </article>
  )
}
