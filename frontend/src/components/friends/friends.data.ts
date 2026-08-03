import type { FriendTab } from './friends.types'

export const FRIEND_TABS: Array<{ id: FriendTab; label: string }> = [
  { id: 'friends', label: '내 친구' },
  { id: 'search', label: '친구 찾기' },
  { id: 'requests', label: '친구 요청' },
]
