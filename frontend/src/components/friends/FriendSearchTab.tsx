import { useState } from 'react'
import FriendAvatar from './FriendAvatar'
import type { Friend } from './friends.types'

const FALLBACK_USER_UID = '101213513'

type FriendSearchTabProps = {
  userUid?: string
  fallbackResult: Friend
  onAdd: (friend: Friend) => void
}

/** UID로 친구를 검색하고 결과를 친구 목록에 추가한다. */
export default function FriendSearchTab({
  userUid,
  fallbackResult,
  onAdd,
}: FriendSearchTabProps) {
  const [query, setQuery] = useState('110111511')
  const [result, setResult] = useState<Friend | null>(fallbackResult)

  const search = () => setResult(query.trim() ? fallbackResult : null)
  const addFriend = () => {
    if (!result) return
    onAdd(result)
    setResult(null)
  }

  return (
    <>
      <div className="friends-search-heading">
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.035em]">친구 찾기</h2>
          <p className="subtitle">UID로 친구를 찾아보세요</p>
        </div>
        <button
          type="button"
          className="friends-uid"
          onClick={() =>
            navigator.clipboard
              ?.writeText(userUid ?? FALLBACK_USER_UID)
              .catch(() => undefined)
          }
        >
          UID: {userUid ?? FALLBACK_USER_UID}
        </button>
      </div>

      <div className="friends-search-form">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && search()}
          aria-label="친구 UID"
          className="friends-search-input"
        />
        <button type="button" onClick={search} className="friends-primary-action px-6 text-sm">
          검색
        </button>
      </div>

      {result && (
        <div className="friends-search-result">
          <FriendAvatar friend={result} />
          <strong className="friend-name">{result.name}</strong>
          <button type="button" onClick={addFriend} className="friends-primary-action">
            친구 추가
          </button>
        </div>
      )}
    </>
  )
}
