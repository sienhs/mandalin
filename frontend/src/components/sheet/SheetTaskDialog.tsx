import Button from '../common/Button'
import { cn } from '../../utils/cn'
import SheetDialog from './SheetDialog'
import type { Period, TaskDraft } from './sheet.types'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'daily', label: '일간' },
  { value: 'weekly', label: '주간' },
  { value: 'none', label: '없음' },
]

type SheetTaskDialogProps = {
  draft: TaskDraft
  onChange: (patch: Partial<TaskDraft>) => void
  /** 선택한 주기로 계산된 목표 횟수 (읽기 전용) */
  targetCount: number
  onClose: () => void
  onSave: () => void
}

/** 과제 설정 팝업: 목표 과제 이름 · 마감 기한 · 목표 횟수 */
export default function SheetTaskDialog({
  draft,
  onChange,
  targetCount,
  onClose,
  onSave,
}: SheetTaskDialogProps) {
  return (
    <SheetDialog>
      <div className="flex w-[400px] flex-col gap-5 rounded-[24px] bg-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] text-left">
        <div>
          <h2 className="m-0 text-xl font-extrabold text-ink-900 mb-2">과제 설정</h2>
          <span className="inline-block rounded-full bg-[#e8dcbd] px-3 py-1 text-xs font-bold text-ink-900">
            {draft.domain}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-title" className="text-[13px] font-bold text-ink-900">
            목표 과제
          </label>
          <input
            id="task-title"
            type="text"
            value={draft.task}
            onChange={(e) => onChange({ task: e.target.value })}
            className="w-full rounded-xl border border-[#e7eaee] p-3 text-[14px] font-semibold text-ink-900 outline-none focus:border-[#97cca1]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-ink-900">마감 기한</span>
          <div className="flex gap-2" role="group" aria-label="마감 기한">
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ period: value })}
                aria-pressed={draft.period === value}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-bold transition-colors',
                  draft.period === value
                    ? 'bg-[#97cca1] text-white shadow-sm border-0'
                    : 'border border-[#e7eaee] text-ink-400 bg-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-target-count" className="text-[13px] font-bold text-ink-900">
            목표 횟수
          </label>
          <input
            id="task-target-count"
            type="number"
            disabled
            value={targetCount}
            className="w-full rounded-xl border border-[#e7eaee] p-3 text-[14px] font-semibold outline-none transition-colors bg-[#f4f5f9] text-ink-500 cursor-not-allowed"
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
