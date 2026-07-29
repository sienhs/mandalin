import Button from '../common/Button'
import { TOTAL_CELLS } from './sheet.data'
import { SheetConfirmDialog } from './SheetDialog'

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
        <Button variant="danger" size="lg" onClick={onClose} className="w-full">
          돌아가서 마저 채우기
        </Button>
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
          한번 생성된 만다라트의 내용은
          <br />
          추후에 <b className="text-ink-900">수정할 수 없습니다.</b>
          <br />
          이대로 생성하시겠습니까?
        </>
      }
    >
      <div className="flex w-full justify-center gap-3">
        <Button variant="ghost" size="lg" onClick={onClose} className="ui-btn--modal">
          계속 편집하기
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          className="ui-btn ui-btn--lg ui-btn--modal bg-[#858ae3] text-white hover:brightness-[1.15]"
        >
          생성하기
        </button>
      </div>
    </SheetConfirmDialog>
  )
}
