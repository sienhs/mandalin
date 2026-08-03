import { useState } from 'react'
import FriendAvatar from './FriendAvatar'
import type { Friend } from './friends.types'

type FriendSearchTabProps = {
  userUid?: string
  onAdd: (friend: Friend) => void
}

/** UID로 친구를 검색하고 결과를 친구 목록에 추가한다. */
export default function FriendSearchTab({ userUid, onAdd }: FriendSearchTabProps) {
  const [query, setQuery] = useState('')
  /**
   * 검색 결과.
   *
   * **아직 서버에 붙어 있지 않다.** 화면 확인용 목업을 걷어냈고, 연동 전까지는 눌러도
   * 결과가 나오지 않는다. 연동: `GET /api/v1/users/{uuid}` 응답을 Friend 로 옮겨 담는다.
   */
  const [result, setResult] = useState<Friend | null>(null)

  const search = () => setResult(null)
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
              ?.writeText(userUid ?? '')
              .catch(() => undefined)
          }
        >
          UID: {userUid ?? ''}
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
