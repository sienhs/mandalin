import { useEffect, useMemo, useState } from 'react'
import FriendAvatar from './FriendAvatar'
import FriendsPagination from './FriendsPagination'
import type { Friend } from './friends.types'

const ITEMS_PER_PAGE = 4

type FriendRequestsTabProps = {
  requests: Friend[]
  onAccept: (request: Friend) => void
  onDecline: (requestId: number) => void
}

/** 받은 친구 요청 목록과 수락·거절 동작을 제공한다. */
export default function FriendRequestsTab({
  requests,
  onAccept,
  onDecline,
}: FriendRequestsTabProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, pageCount)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const visibleRequests = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return requests.slice(start, start + ITEMS_PER_PAGE)
  }, [requests, safePage])

  return (
    <>
      <h2 className="text-xl font-extrabold tracking-[-0.035em]">친구 요청</h2>
      <p className="subtitle">{requests.length}건의 친구 요청이 있어요</p>

      <ul className="friends-list">
        {visibleRequests.map((request) => (
          <li key={request.id} className="friend-row">
            <FriendAvatar friend={request} />
            <strong className="friend-name">{request.name}</strong>
            <div className="friend-actions">
              <button
                type="button"
                onClick={() => onAccept(request)}
                className="friends-primary-action"
              >
                수락
              </button>
              <button
                type="button"
                onClick={() => onDecline(request.id)}
                className="friends-secondary-action"
              >
                거절
              </button>
            </div>
          </li>
        ))}
      </ul>

      {requests.length > 0 && (
        <FriendsPagination
          page={safePage}
          pageCount={pageCount}
          onChange={setPage}
          label="친구 요청 페이지"
        />
      )}
    </>
  )
}
