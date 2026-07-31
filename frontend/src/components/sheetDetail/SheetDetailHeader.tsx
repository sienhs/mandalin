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
    <header className="sheet-detail-header">
      <div className="sheet-detail-heading">
        <h1 className="sheet-detail-title">{sheet.title}</h1>
        <span className={cn('pill', sheet.isOpen ? 'pill-mint' : 'pill-slate')}>
          {sheet.isOpen ? '공개' : '비공개'}
        </span>
      </div>

      {/* 누른 상태의 색은 aria-pressed 를 선택자로 쓴다(styles/sheet-detail.css) */}
      {readOnly ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLike}
          aria-pressed={liked}
          aria-label={`좋아요 ${likeCount}개`}
          className="sheet-detail-like"
        >
          <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
          {likeCount}
        </Button>
      ) : (
        <p className="sheet-detail-period">
          {toDottedDate(sheet.createdAt)}~{toDottedDate(sheet.expiredAt)}
        </p>
      )}

      <div className="sheet-detail-rate">
        <p className="sheet-detail-rate-text">달성률 {achievementRate}%</p>
        <ProgressBar
          value={achievementRate}
          label={`${sheet.title} 달성률`}
          className="sheet-detail-rate-bar"
        />
      </div>

      <Button variant="primary" onClick={onOpenVillage}>
        3D 마을 보기
      </Button>
    </header>
  )
}
