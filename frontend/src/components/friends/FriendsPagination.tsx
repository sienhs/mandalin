import { cn } from '../../utils/cn'

type FriendsPaginationProps = {
  page: number
  pageCount?: number
  onChange: (page: number) => void
  label: string
}

/** 친구 목록과 요청 목록에서 함께 사용하는 페이지 이동 컨트롤. */
export default function FriendsPagination({
  page,
  pageCount = 3,
  onChange,
  label,
}: FriendsPaginationProps) {
  return (
    <nav className="friends-pagination" aria-label={label}>
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="friends-page-button"
      >
        ‹
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          aria-label={`${number}페이지`}
          aria-current={page === number ? 'page' : undefined}
          onClick={() => onChange(number)}
          className={cn(
            'friends-page-button',
            page === number && 'friends-page-button-active',
          )}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page === pageCount}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        className="friends-page-button"
      >
        ›
      </button>
    </nav>
  )
}
