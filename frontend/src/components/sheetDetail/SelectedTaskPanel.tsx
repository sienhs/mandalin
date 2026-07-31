import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import type { DetailSubject, SelectedTask } from './sheetDetail.types'
import { PERIOD_LABEL, PERIOD_TERM } from './sheetDetail.utils'

type SelectedTaskPanelProps = {
  task: SelectedTask
  /** '수행 완료' */
  onComplete: () => void
  /** 남의 만다라트를 보는 중. 수행에 관한 안내와 버튼을 감춘다. */
  readOnly?: boolean
}

/** 칸 종류에 따른 패널 머리말 */
const KIND_LABEL: Record<SelectedTask['kind'], string> = {
  sheet: '선택한 핵심 목표',
  domain: '선택한 도메인',
  subject: '선택한 과제',
}

/**
 * 과제 칸의 안내 문구. 버튼을 누를 수 없을 때는 왜 못 누르는지를 알려준다.
 * isDonePeriod = 이번 기간에 이미 수행함 → 다음 기간이 오기 전에는 다시 수행할 수 없다.
 */
const noticeOf = (subject: DetailSubject): string => {
  if (subject.isDone) return `이미 완료한 과제예요. (+${subject.point}P 획득)`
  if (subject.isDonePeriod) {
    return `${PERIOD_TERM[subject.period]} 수행은 이미 마쳤어요. 다음 기간에 또 할 수 있어요.`
  }
  return `수행할 때마다 1회씩 올라갑니다. (목표 달성 시 +${subject.point}P)`
}

/**
 * 3x3 확대 그리드 아래의 '선택한 과제' 패널.
 *
 * 과제 칸이면 수행 횟수와 '수행 완료' 버튼을, 도메인 · 핵심 목표 칸이면 그 칸이 포함하고 있는
 * 과제의 진행도를 보여준다 — 직접 수행할 수 없는 칸이라도 얼마나 채웠는지는 알려준다.
 */
export default function SelectedTaskPanel({
  task,
  onComplete,
  readOnly = false,
}: SelectedTaskPanelProps) {
  const { kind, title, domainTitle, subject, progressRate } = task

  return (
    <section aria-labelledby="selected-task" className="sheet-detail-task">
      <p id="selected-task" className="sheet-detail-task-label">
        {KIND_LABEL[kind]}
      </p>

      <p className="sheet-detail-task-title">
        {domainTitle ? `${domainTitle}>${title}` : title}
      </p>

      {subject && (
        <p className="sheet-detail-task-meta">
          {PERIOD_LABEL[subject.period]} · {subject.tryCount}/{subject.targetCount}회 수행
        </p>
      )}

      {/* 진행도는 칸 종류와 무관하게 같은 자리에 보여준다(과제 = 그 과제의 progress). */}
      {progressRate !== null && (
        <>
          <p className="sheet-detail-task-meta">진행도 {progressRate}%</p>
          <ProgressBar
            value={progressRate}
            label={`${title} 진행도`}
            className="sheet-detail-task-bar"
          />
        </>
      )}

      {/* 남의 만다라트에서는 수행에 관한 안내와 버튼을 아예 빼둔다. */}
      {!readOnly &&
        (subject ? (
          <>
            <p className="sheet-detail-task-notice">{noticeOf(subject)}</p>
            <Button
              variant="primary"
              size="lg"
              className="sheet-detail-task-button"
              disabled={subject.isDone || subject.isDonePeriod}
              onClick={onComplete}
            >
              수행 완료
            </Button>
          </>
        ) : (
          <p className="sheet-detail-task-notice">과제 칸을 선택하면 수행할 수 있어요.</p>
        ))}
    </section>
  )
}
