import { cn } from '../../utils/cn'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import type { Sheet } from '../sheet/sheet.types'
import { toDottedDate } from '../sheetList/sheetList.utils'

type SheetDetailHeaderProps = {
  sheet: Sheet
  /** 달성률 0~100. 과제 진행률의 평균(sheetDetail.utils). */
  achievementRate: number
  /** 우상단 '내 마을 보기' */
  onOpenVillage: () => void
  /**
   * 남의 만다라트를 보는 중. 기간을 감추고 좋아요 버튼을 보여준다 —
   * 남의 목표 기간은 알려줄 정보가 아니고, 좋아요는 남의 것에만 누른다.
   */
  readOnly?: boolean
  /** 내가 좋아요를 누른 상태인지 */
  liked?: boolean
  /** 좋아요 수 */
  likeCount?: number
  onToggleLike?: () => void
}

/** 상세 화면 머리말: 시트명 · 공개 여부 · 기간(내 것) 또는 좋아요(남의 것) · 달성률 · 마을 보기 */
export default function SheetDetailHeader({
  sheet,
  achievementRate,
  onOpenVillage,
  readOnly = false,
  liked = false,
  likeCount = 0,
  onToggleLike,
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

      {readOnly ? (
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
          aria-label={`좋아요 ${likeCount}개`}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1',
            'text-[12.5px] font-bold transition-colors',
            liked
              ? 'border-[#f3b6c2] bg-[#ffeef2] text-[#d94b6a]'
              : 'border-ink-100 bg-white text-ink-400 hover:bg-ink-100',
          )}
        >
          <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
          {likeCount}
        </button>
      ) : (
        <p className="m-0 whitespace-nowrap text-[13px] font-semibold text-ink-400">
          {toDottedDate(sheet.createdAt)}~{toDottedDate(sheet.expiredAt)}
        </p>
      )}

      {/* 달성률: 글자 + 진행 바. 채움 색은 공통 ProgressBar 가 --progress-accent 로 받는다. */}
      <div className="ml-auto flex items-center gap-3 [--progress-accent:#6cbf7f]">
        {/* 달성률은 서버가 확정한 값이라 완료 개수와 같은 값이 아니다. 따로 적는다. */}
        <p className="m-0 whitespace-nowrap text-[12.5px] font-semibold text-ink-500">
          달성률 {achievementRate}%
        </p>
        <ProgressBar
          value={achievementRate}
          label={`${sheet.title} 달성률`}
          className="w-[180px]"
        />
      </div>

      <Button variant="primary" onClick={onOpenVillage}>
        3D 마을 보기
      </Button>
    </header>
  )
}
