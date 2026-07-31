import { useMemo, useState } from 'react'
import Button from '../common/Button'
import type { Friend } from '../friends/friends.types'
import SheetDialog from '../sheet/SheetDialog'
import { cn } from '../../utils/cn'

type GroupInviteDialogProps = {
  friends: Friend[]
  /** 이미 초대한 친구. 다시 초대할 수 없다. */
  invitedIds: number[]
  onInvite: (friendId: number) => void
  onClose: () => void
}

/**
 * 그룹에 친구를 초대하는 팝업.
 *
 * 초대는 한 명씩 바로 보낸다 — 여러 명을 골라 한 번에 보내는 방식이 아니라,
 * 목록에서 누르는 즉시 초대되고 그 줄이 '초대됨'으로 바뀐다.
 */
export default function GroupInviteDialog({
  friends,
  invitedIds,
  onInvite,
  onClose,
}: GroupInviteDialogProps) {
  const [query, setQuery] = useState('')

  const visibleFriends = useMemo(() => {
    const keyword = query.trim()
    if (!keyword) return friends
    return friends.filter((friend) => friend.name.includes(keyword))
  }, [friends, query])

  return (
    <SheetDialog labelledBy="group-invite-title">
      <div className="group-invite-dialog">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="group-invite-close"
        >
          ✕
        </button>

        <h2 id="group-invite-title" className="group-invite-title">
          친구 초대하기
        </h2>
        <p className="group-invite-desc">
          만다라트를 함께 달성할 친구를 찾아 초대해보세요.
          <br />
          아래 친구 목록에서 바로 선택할 수 있습니다.
        </p>

        <div className="group-invite-search">
          <label htmlFor="group-invite-query" className="group-invite-search-label">
            내 친구목록
          </label>
          <input
            id="group-invite-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름으로 찾기"
            className="group-invite-input"
          />
        </div>

        {visibleFriends.length > 0 ? (
          <ul className="group-invite-list">
            {visibleFriends.map((friend) => {
              const invited = invitedIds.includes(friend.id)
              return (
                <li key={friend.id} className="group-invite-item">
                  {/*
                    친구 화면의 FriendAvatar 를 쓰지 않는다 — 그 아바타는 48px 에 반응형
                    크기(sm:size-13)라 이 팝업에서는 너무 크다. 색(avatarColor)만 가져온다.
                  */}
                  <span aria-hidden="true" className={cn('group-invite-avatar', friend.avatarColor)}>
                    {friend.name.slice(-1)}
                  </span>
                  <span className="group-invite-name">{friend.name}</span>
                  {invited ? (
                    <Button variant="ghost" size="sm" disabled className="group-invite-action">
                      초대됨
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onInvite(friend.id)}
                      className="group-invite-action"
                    >
                      초대
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="group-invite-empty">찾는 친구가 없어요.</p>
        )}
      </div>
    </SheetDialog>
  )
}
