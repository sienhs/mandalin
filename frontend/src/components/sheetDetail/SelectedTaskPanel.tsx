import Button from '../common/Button'
import type { SelectedTask } from './sheetDetail.types'
import { PERIOD_LABEL } from './sheetDetail.utils'

type SelectedTaskPanelProps = {
  task: SelectedTask
  /** '수행 완료' */
  onComplete: () => void
}

/**
 * 3x3 확대 그리드 아래의 '선택한 과제' 패널.
 * 과제 칸을 선택했을 때만 수행 완료 버튼을 보여준다 — 도메인 · 핵심 목표 칸은 수행할 게 없다.
 */
export default function SelectedTaskPanel({ task, onComplete }: SelectedTaskPanelProps) {
  const { title, domainTitle, subject } = task

  return (
    <section
      aria-labelledby="selected-task"
      className="rounded-2xl border-[3px] border-[#e9f6e8] bg-[#f5fbf4] p-4"
    >
      <p id="selected-task" className="m-0 text-[12px] font-extrabold text-[#8cc396]">
        선택한 과제
      </p>

      <p className="m-0 mt-1.5 text-[15px] font-extrabold tracking-[-0.01em] text-ink-900">
        {domainTitle ? `${domainTitle}>${title}` : title}
      </p>

      {subject ? (
        <>
          <p className="m-0 mt-1 text-[12px] font-semibold text-ink-400">
            {PERIOD_LABEL[subject.period]} · {subject.tryCount}/{subject.targetCount}회 수행
          </p>
          <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-ink-500">
            {subject.isDone
              ? `이미 완료한 과제예요. (+${subject.point}P 획득)`
              : `완료하면 진행도가 올라갑니다. (+${subject.point}P)`}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-3 w-full"
            disabled={subject.isDone}
            onClick={onComplete}
          >
            수행 완료
          </Button>
        </>
      ) : (
        <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-ink-500">
          도메인 칸이에요. 과제 칸을 선택하면 수행할 수 있어요.
        </p>
      )}
    </section>
  )
}
