import Button from '../common/Button'
import SheetDialog from './SheetDialog'
import type { TaskDraft } from './sheet.types'

type SheetDomainDialogProps = {
  draft: TaskDraft
  onChange: (patch: Partial<TaskDraft>) => void
  onClose: () => void
  onSave: () => void
}

/**
 * 도메인 설정 팝업: 목표 도메인 이름만 받는다.
 */
export default function SheetDomainDialog({
  draft,
  onChange,
  onClose,
  onSave,
}: SheetDomainDialogProps) {
  return (
    <SheetDialog labelledBy="domain-dialog-title">
      <div className="flex w-[400px] flex-col gap-5 rounded-[24px] bg-white p-6 text-left shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
        <h2 id="domain-dialog-title" className="m-0 text-xl font-extrabold text-ink-900">
          도메인 설정
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="domain-title" className="text-[13px] font-bold text-ink-900">
            목표 도메인
          </label>
          <input
            id="domain-title"
            type="text"
            value={draft.task}
            onChange={(e) => onChange({ task: e.target.value })}
            className="w-full rounded-xl border border-[#e7eaee] p-3 text-[14px] font-semibold text-ink-900 outline-none focus:border-[#97cca1]"
          />
        </div>

        <div className="mt-2 flex w-full justify-center gap-3">
          <Button variant="ghost" size="lg" onClick={onClose} className="ui-btn--modal">
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={onSave} className="ui-btn--modal">
            저장
          </Button>
        </div>
      </div>
    </SheetDialog>
  )
}
