import { cn } from '../../utils/cn'
import './ProgressBar.css'

type ProgressBarProps = {
  /** 진행률 0~100. 범위를 벗어난 값은 잘라낸다. */
  value: number
  /** 스크린리더가 읽을 이름 */
  label: string
  className?: string
}

/** 진행률 막대. 채움 색은 조상이 지정한 --progress-accent 를 따른다. */
export default function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn('ui-progress', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="ui-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
