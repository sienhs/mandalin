import Button from '../common/Button'
import SheetDialog from '../sheet/SheetDialog'
import { cn } from '../../utils/cn'
// 이 팝업의 스타일. 페이지가 아니라 컴포넌트가 직접 불러온다 — 다른 화면에서 써도 스타일이 붙는다.
import '../../styles/group-detail.css'

type GroupMoveDialogProps = {
  /** 선택한 멤버 이름 */
  memberName: string
  /** 멤버 색 클래스(group-detail-member--*). 아바타 배경에 그 색을 쓴다. */
  colorClass: string
  onConfirm: () => void
  onClose: () => void
}

/** 선택한 멤버의 만다라트로 이동할지 확인하는 팝업 */
export default function GroupMoveDialog({
  memberName,
  colorClass,
  onConfirm,
  onClose,
}: GroupMoveDialogProps) {
  return (
    <SheetDialog labelledBy="group-move-title">
      <div className="group-move-dialog">
        <span className={cn('group-move-avatar', colorClass)} aria-hidden="true">
          {memberName.trim().slice(0, 1)}
        </span>

        <h2 id="group-move-title" className="group-move-title">
          {memberName}님의 만다라트
        </h2>
        <p className="group-move-desc">이 만다라트로 이동할까요?</p>

        <div className="group-move-actions">
          <Button variant="primary" size="lg" className="ui-btn--modal" onClick={onConfirm}>
            이동하기
          </Button>
          <Button variant="ghost" size="lg" className="ui-btn--modal" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </SheetDialog>
  )
}
