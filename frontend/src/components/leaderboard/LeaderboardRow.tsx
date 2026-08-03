import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import type { LeaderboardEntry } from './leaderboard.types'

type LeaderboardRowProps = {
  entry: LeaderboardEntry
  rank: number
}

const AVATAR_COLORS = [
  'bg-[#A891F4]',
  'bg-[#4C91F2]',
  'bg-[#FF8129]',
  'bg-[#22C994]',
] as const

/** 순위, 작성자, 좋아요 수와 만다라트 이동 버튼을 한 행으로 표시한다. */
export default function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  return (
    <li className="leaderboard-row">
      <span
        className={cn(
          'leaderboard-rank',
          rank === 1 && 'leaderboard-rank-first',
          rank === 2 && 'leaderboard-rank-second',
          rank === 3 && 'leaderboard-rank-third',
        )}
        aria-label={`${rank}위`}
      >
        {rank}
      </span>

      <span
        className={cn(
          'leaderboard-avatar',
          AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length],
        )}
        aria-hidden="true"
      >
        {entry.ownerProfileImageUrl ? (
          <img src={entry.ownerProfileImageUrl} alt="" />
        ) : (
          entry.ownerName.slice(-1)
        )}
      </span>

      <span className="min-w-0 flex-1">
        <strong className="leaderboard-title">{entry.title}</strong>
        <span className="leaderboard-owner">
          {entry.ownerName}님의 만다라트
        </span>
      </span>

      <span className="leaderboard-likes" aria-label={`좋아요 ${entry.likeCount}개`}>
        <span aria-hidden="true">♥</span>
        {entry.likeCount.toLocaleString('ko-KR')}
      </span>

      <Link
        to={`/village?sheetId=${entry.sheetId}`}
        aria-label={`${entry.title} 만다라트 보기`}
        className="leaderboard-view-button"
      >
        만다라트 보기 <span aria-hidden="true">→</span>
      </Link>
    </li>
  )
}

