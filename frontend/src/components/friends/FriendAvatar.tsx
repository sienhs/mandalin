import { cn } from '../../utils/cn'
import type { Friend } from './friends.types'

/** 친구 이름의 마지막 글자와 지정 색상을 사용하는 공통 아바타. */
export default function FriendAvatar({ friend }: { friend: Friend }) {
  return (
    <div
      aria-hidden="true"
      className={cn('friend-avatar', friend.avatarColor)}
    >
      {friend.name.slice(-1)}
    </div>
  )
}
