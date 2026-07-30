import { cn } from '../../utils/cn'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import type { Sheet } from '../sheet/sheet.types'
import { toDottedDate } from '../sheetList/sheetList.utils'
import { TOTAL_SUBJECTS } from './sheetDetail.utils'

type SheetDetailHeaderProps = {
  sheet: Sheet
  /** 완료한 과제 수 */
  doneCount: number
  /** 달성률 0~100 */
  achievementRate: number
  /** 우상단 '내 마을 보기' */
  onOpenVillage: () => void
}

/** 상세 화면 머리말: 시트명 · 공개 여부 · 기간 · 달성률 · 내 마을 보기 */
export default function SheetDetailHeader({
  sheet,
  doneCount,
  achievementRate,
  onOpenVillage,
}: SheetDetailHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="m-0 truncate text-[19px] font-extrabold tracking-[-0.02em] text-ink-900">
          {sheet.title}
        </h1>
        <span className={cn('pill', sheet.isOpen ? 'pill-mint' : 'pill-slate')}>
          {sheet.isOpen ? '공개' : '비공개'}
        </span>
      </div>

      <p className="m-0 whitespace-nowrap text-[13px] font-semibold text-ink-400">
        {toDottedDate(sheet.createdAt)}~{toDottedDate(sheet.expiredAt)}
      </p>

      {/* 달성률: 글자 + 진행 바. 채움 색은 공통 ProgressBar 가 --progress-accent 로 받는다. */}
      <div className="ml-auto flex items-center gap-3 [--progress-accent:#6cbf7f]">
        <p className="m-0 whitespace-nowrap text-[12.5px] font-semibold text-ink-500">
          달성률 {achievementRate}%({doneCount}/{TOTAL_SUBJECTS} 완료)
        </p>
        <ProgressBar
          value={achievementRate}
          label={`${sheet.title} 달성률`}
          className="w-[180px]"
        />
      </div>

      <Button variant="primary" onClick={onOpenVillage}>
        내 마을 보기
      </Button>
    </header>
  )
}
