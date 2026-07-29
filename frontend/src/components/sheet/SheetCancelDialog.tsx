import { Link } from 'react-router-dom'
import { DIALOG_GHOST_BUTTON, SheetConfirmDialog } from './SheetDialog'

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
      <div className="flex w-full gap-3">
        {/* TODO: 나갈 경로 연결 */}
        <Link to="#" className={DIALOG_GHOST_BUTTON}>
          나가기
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="btn flex-1 rounded-xl bg-[#b85b56] text-[15px] text-white hover:brightness-[1.15]"
        >
          계속 편집하기
        </button>
      </div>
    </SheetConfirmDialog>
  )
}
