import { cn } from '../../utils/cn'

type LeaderboardPaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** 리더보드 목록의 페이지 이동 컨트롤. */
export default function LeaderboardPagination({
  page,
  pageCount,
  onChange,
}: LeaderboardPaginationProps) {
  return (
    <nav className="leaderboard-pagination" aria-label="리더보드 페이지">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
      >
        ‹
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
        <button
          type="button"
          key={number}
          aria-label={`${number}페이지`}
          aria-current={page === number ? 'page' : undefined}
          onClick={() => onChange(number)}
          className={cn(page === number && 'leaderboard-page-active')}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page === pageCount}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
      >
        ›
      </button>
    </nav>
  )
}

