import { TOTAL_CELLS } from './sheet.data'
import { DIALOG_GHOST_BUTTON, SheetConfirmDialog } from './SheetDialog'

type SheetSaveDialogProps = {
  /** 채워진 칸 수. 81칸을 채우지 못하면 경고만 보여준다. */
  filledCount: number
  onClose: () => void
  onConfirm: () => void
}

/** 저장 확인 팝업. 빈칸이 남았을 때와 생성 직전일 때를 구분해 보여준다. */
export default function SheetSaveDialog({
  filledCount,
  onClose,
  onConfirm,
}: SheetSaveDialogProps) {
  if (filledCount < TOTAL_CELLS) {
    return (
      <SheetConfirmDialog
        titleId="save-title"
        icon="⚠️"
        iconClass="bg-[#b85b56]"
        title="만다라트를 다 채우지 못했습니다"
        description={
          <>
            작성하지 않은 빈칸이 있습니다.
            <br />
            만다라트는 모든 칸을 채워야만 생성이 가능합니다.
            <br />
            빈칸을 모두 채운 후 다시 시도해주세요.
          </>
        }
      >
        <button
          type="button"
          onClick={onClose}
          className="btn w-full rounded-xl bg-[#b85b56] text-[15px] text-white hover:brightness-[1.15]"
        >
          돌아가서 마저 채우기
        </button>
      </SheetConfirmDialog>
    )
  }

  return (
    <SheetConfirmDialog
      titleId="save-title"
      icon="❓"
      iconClass="bg-[#858ae3]"
      title="정말 생성하시겠습니까?"
      description={
        <>
          한번 수정된 만다라트의 내용은 추후에{' '}
          <b className="text-ink-900">수정할 수 없습니다.</b>
          <br />
          이대로 생성하시겠습니까?
        </>
      }
    >
      <div className="flex w-full gap-3">
        <button type="button" onClick={onClose} className={DIALOG_GHOST_BUTTON}>
          계속 편집하기
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn flex-1 rounded-xl border-0 bg-[#858ae3] text-[15px] text-white hover:brightness-[1.15]"
        >
          생성하기
        </button>
      </div>
    </SheetConfirmDialog>
  )
}
