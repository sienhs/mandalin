import Button from '../common/Button'
import { cn } from '../../utils/cn'

const TEXT_INPUT =
  'w-full rounded-[10px] border border-[#e7eaee] px-3 py-[5px] text-[13px] text-ink-900 outline-none focus:border-[#97cca1]'
const DATE_INPUT =
  'w-full rounded-[10px] border border-[#e7eaee] px-3 py-[5px] text-[12.5px] text-ink-900 outline-none focus:border-[#97cca1]'

type SheetBasicSettingsProps = {
  mainGoal: string
  onMainGoalChange: (value: string) => void
  startDate: string
  onStartDateChange: (value: string) => void
  endDate: string
  onEndDateChange: (value: string) => void
  isPublic: boolean
  onPublicChange: (value: boolean) => void
  /** 선택한 칸의 과제 설정 팝업 열기 */
  onManualTaskCreate: () => void
}

/** 좌측 sticky 패널: 핵심 목표 · 기간 · 공개 여부 · 과제 생성 버튼 */
export default function SheetBasicSettings({
  mainGoal,
  onMainGoalChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isPublic,
  onPublicChange,
  onManualTaskCreate,
}: SheetBasicSettingsProps) {
  return (
    <section
      className="card sticky top-[84px] flex flex-col gap-4 p-5"
      aria-labelledby="basic-settings"
    >
      <h2 id="basic-settings" className="section-title m-0 text-[15px]">
        기본 설정
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="core-goal" className="text-xs font-bold text-ink-400">
          핵심 목표
        </label>
        <input
          id="core-goal"
          type="text"
          value={mainGoal}
          onChange={(e) => onMainGoalChange(e.target.value)}
          placeholder="핵심 목표를 입력하세요"
          className={TEXT_INPUT}
        />
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1.5 p-0 text-xs font-bold text-ink-400">기간 설정</legend>
        <div className="flex gap-1.5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="start-date" className="sr-only">
              시작일
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={DATE_INPUT}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="end-date" className="sr-only">
              종료일
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={DATE_INPUT}
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-ink-400">공개 여부</span>
        <div className="flex gap-1.5" role="group" aria-label="공개 여부">
          <button
            type="button"
            onClick={() => onPublicChange(true)}
            aria-pressed={isPublic}
            className={cn(
              'pill cursor-pointer border-0',
              isPublic ? 'bg-[#97cca1] text-white' : 'bg-[#e3f8f1] text-ink-400',
            )}
          >
            공개
          </button>
          <button
            type="button"
            onClick={() => onPublicChange(false)}
            aria-pressed={!isPublic}
            className={cn(
              'pill cursor-pointer border-0',
              !isPublic ? 'bg-[#97cca1] text-white' : 'bg-[#e3f8f1] text-ink-400',
            )}
          >
            비공개
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="danger" size="sm" className="w-full">
          AI로 과제 생성
        </Button>
        <Button variant="primary" size="sm" className="w-full" onClick={onManualTaskCreate}>
          수동 과제 생성
        </Button>
      </div>
    </section>
  )
}
