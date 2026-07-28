import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FriendAvatar from './FriendAvatar'
import FriendsPagination from './FriendsPagination'
import type { Friend } from './friends.types'

const ITEMS_PER_PAGE = 4

type FriendListTabProps = {
  friends: Friend[]
  onRemove: (friendId: number) => void
}

/** 내 친구 목록과 페이지 이동을 표시한다. */
export default function FriendListTab({ friends, onRemove }: FriendListTabProps) {
  const [page, setPage] = useState(1)
  const visibleFriends = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return friends.slice(start, start + ITEMS_PER_PAGE)
  }, [friends, page])

  return (
    <>
      <h2 className="text-xl font-extrabold tracking-[-0.035em]">내 친구</h2>
      <p className="subtitle">{friends.length}명의 친구와 목표를 키워가고 있어요</p>

      <ul className="friends-list">
        {visibleFriends.map((friend) => (
          <li key={friend.id} className="friend-row">
            <FriendAvatar friend={friend} />
            <strong className="friend-name">{friend.name}</strong>
            <div className="friend-actions">
              <Link to="/village" className="friends-primary-action">
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

      <FriendsPagination page={page} onChange={setPage} label="친구 목록 페이지" />
    </>
  )
}
