import { cn } from '../../utils/cn'

type MyPageStatCardProps = {
  label: string
  value: string
  suffix?: string
  tone: 'brand' | 'blue' | 'orange'
  progress?: number
}

/** 마이페이지의 과제·건물·달성률 통계를 동일한 형태로 표시한다. */
export default function MyPageStatCard({
  label,
  value,
  suffix,
  tone,
  progress,
}: MyPageStatCardProps) {
  return (
    <article className="mypage-stat-card">
      <p className="mypage-stat-label">{label}</p>
      <p className={cn('mypage-stat-value', `mypage-stat-value-${tone}`)}>
        {value}
        {suffix && <span className="mypage-stat-suffix">{suffix}</span>}
      </p>
      {progress != null && (
        <div
          className="mypage-progress-track"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span
            className="mypage-progress-value"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </article>
  )
}
