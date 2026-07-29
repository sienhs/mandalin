import { Link } from 'react-router-dom'
import Button from '../common/Button'
import { buttonClass } from '../common/buttonClass'
import { SheetConfirmDialog } from './SheetDialog'

type SheetCancelDialogProps = {
  onClose: () => void
}

/** 취소 확인 팝업 */
export default function SheetCancelDialog({ onClose }: SheetCancelDialogProps) {
  return (
    <SheetConfirmDialog
      titleId="cancel-title"
      icon="⚠️"
      iconClass="bg-[#b85b56]"
      title="정말 취소하시겠습니까?"
      description={
        <>
          저장되지 않은 내용은 모두 삭제됩니다.
          <br />
          그래도 나가시겠습니까?
        </>
      }
    >
      <div className="flex w-full justify-center gap-3">
        {/* 작성 중인 내용을 버리고 목록으로 돌아간다. */}
        <Link
          to="/sheets"
          className={buttonClass({ variant: 'ghost', size: 'lg', className: 'ui-btn--modal' })}
        >
          나가기
        </Link>
        <Button variant="danger" size="lg" onClick={onClose} className="ui-btn--modal">
          계속 편집하기
        </Button>
      </div>
    </SheetConfirmDialog>
  )
}
