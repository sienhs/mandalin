import { SheetListConfirmDialog } from './SheetListDialog'

type SheetDeleteDialogProps = {
  /** 삭제할 만다라트 이름. 읽는 사람이 대상을 확인할 수 있도록 보조 설명에 넣는다. */
  title: string
  onConfirm: () => void
  onClose: () => void
}

/** 만다라트 삭제 확인 팝업 */
export default function SheetDeleteDialog({
  title,
  onConfirm,
  onClose,
}: SheetDeleteDialogProps) {
  return (
    <SheetListConfirmDialog
      titleId="sheet-delete-title"
      icon="⚠️"
      tone="danger"
      title="정말 삭제하시겠습니까?"
      description={
        <>
          <b className="font-extrabold text-ink-700">{title}</b> — 이 작업은 되돌릴 수 없으며,
          <br />
          연결된 모든 태스크가 삭제됩니다.
        </>
      }
      confirmLabel="삭제하기"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
