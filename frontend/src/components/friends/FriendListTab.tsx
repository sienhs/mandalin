import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FriendAvatar from './FriendAvatar'
import FriendsPagination from './FriendsPagination'
import type { Friend } from './friends.types'

const ITEMS_PER_PAGE = 10

type FriendListTabProps = {
  friends: Friend[]
  onRemove: (friendId: number) => void
}

/** 내 친구 목록과 페이지 이동을 표시한다. */
export default function FriendListTab({ friends, onRemove }: FriendListTabProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(friends.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, pageCount)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const visibleFriends = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return friends.slice(start, start + ITEMS_PER_PAGE)
  }, [friends, safePage])

  return (
    <>
      <h2 className="text-xl font-extrabold tracking-[-0.035em]">내 친구</h2>
      <p className="subtitle">{friends.length}명의 친구와 목표를 키워가고 있어요</p>

      {friends.length > 0 ? (
        <ul className="friends-list">
          {visibleFriends.map((friend) => (
            <li key={friend.id} className="friend-row">
              <FriendAvatar friend={friend} />
              <strong className="friend-name">{friend.name}</strong>
              <div className="friend-actions">
                <Link
                  to={`/friends/${friend.id}/sheets`}
                  state={{ friendName: friend.name }}
                  aria-label={`${friend.name}의 만다라트 보기`}
                  className="friends-primary-action"
                >
                  <span className="hidden sm:inline">만다라트 보기 </span>→
                </Link>
                <button
                  type="button"
                  onClick={() => onRemove(friend.id)}
                  aria-label={`${friend.name} 친구 삭제`}
                  className="friends-secondary-action"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="friends-empty">아직 등록된 친구가 없어요.</p>
      )}

      {friends.length > 0 && (
        <FriendsPagination
          page={safePage}
          pageCount={pageCount}
          onChange={setPage}
          label="친구 목록 페이지"
        />
      )}
    </>
  )
}
