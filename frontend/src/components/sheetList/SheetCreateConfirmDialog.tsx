import { SheetListConfirmDialog } from './SheetListDialog'

type SheetCreateConfirmDialogProps = {
  onConfirm: () => void
  onClose: () => void
}

/** 만다라트 생성 확인 팝업 */
export default function SheetCreateConfirmDialog({
  onConfirm,
  onClose,
}: SheetCreateConfirmDialogProps) {
  return (
    <SheetListConfirmDialog
      titleId="sheet-create-title"
      icon="🏙️"
      tone="mint"
      title="새 만다라트를 생성하시겠어요?"
      description={
        <>
          64개의 칸으로 목표를 세우고,
          <br />
          완료될 때마다 도시가 함께 성장해요.
        </>
      }
      confirmLabel="생성하기"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
