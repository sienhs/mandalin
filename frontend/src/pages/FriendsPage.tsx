import { useState } from 'react'
import Header from '../components/common/Header'
import FriendListTab from '../components/friends/FriendListTab'
import FriendRequestsTab from '../components/friends/FriendRequestsTab'
import FriendSearchTab from '../components/friends/FriendSearchTab'
import {
  FRIEND_TABS,
  MOCK_FRIENDS,
  MOCK_REQUESTS,
  MOCK_SEARCH_RESULT,
} from '../components/friends/friends.data'
import type { Friend, FriendTab } from '../components/friends/friends.types'
import { useAuth } from '../contexts/auth'
import { cn } from '../utils/cn'
import '../styles/friends.css'

type FriendsPageProps = {
  initialFriends?: Friend[]
}

/** 친구 목록, UID 검색, 받은 요청 탭의 공유 상태를 관리하는 페이지. */
export default function FriendsPage({ initialFriends }: FriendsPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FriendTab>('friends')
  const [friends, setFriends] = useState(() =>
    initialFriends?.length ? initialFriends : MOCK_FRIENDS,
  )
  const [requests, setRequests] = useState(MOCK_REQUESTS)

  const addFriend = (friend: Friend) => {
    setFriends((current) =>
      current.some(({ id }) => id === friend.id) ? current : [...current, friend],
    )
  }

  const acceptRequest = (request: Friend) => {
    addFriend(request)
    setRequests((current) => current.filter(({ id }) => id !== request.id))
  }

  return (
    <div className="page-shell">
      <Header hasNotification={requests.length > 0} />

      <main className="friends-main">
        <div className="friends-heading-row">
          <h1 className="text-2xl font-extrabold tracking-[-0.04em]">친구</h1>
          <div
            className="friends-tabs"
            role="tablist"
            aria-label="친구 메뉴"
          >
            {FRIEND_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'friends-tab',
                  activeTab === tab.id && 'friends-tab-active',
                )}
              >
                {tab.label}
                {tab.id === 'requests' &&
                  requests.length > 0 &&
                  activeTab !== 'requests' && (
                    <span aria-hidden="true" className="friends-tab-notice" />
                  )}
              </button>
            ))}
          </div>
        </div>

        <section className="friends-panel">
          {activeTab === 'friends' && (
            <FriendListTab friends={friends} onRemove={(id) =>
              setFriends((current) => current.filter((friend) => friend.id !== id))
            } />
          )}
          {activeTab === 'search' && (
            <FriendSearchTab
              userUid={user?.uuid}
              fallbackResult={MOCK_SEARCH_RESULT}
              onAdd={addFriend}
            />
          )}
          {activeTab === 'requests' && (
            <FriendRequestsTab
              requests={requests}
              onAccept={acceptRequest}
              onDecline={(id) =>
                setRequests((current) => current.filter((request) => request.id !== id))
              }
            />
          )}
        </section>
      </main>
    </div>
  )
}
