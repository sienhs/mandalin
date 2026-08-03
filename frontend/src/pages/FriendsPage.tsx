import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../data/store'
import Button from '../components/common/ActionButton'
import { UuidChip } from '../components/common/UuidChip'
import Modal from '../components/common/Modal'
import {
  Avatar,
  Badge,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Segmented,
  Skeleton,
} from '../components/common/Primitives'
import { fromNow } from '../utils/format'
import { useToast } from '../components/common/Toast'

type Tab = 'list' | 'search' | 'requests'

export default function Friends() {
  const {
    friends,
    requests,
    gateway,
    acceptRequest,
    rejectRequest,
    removeFriend,
    sendFriendRequest,
    reloadFriends,
  } = useStore()
  const [params, setParams] = useSearchParams()
  const toast = useToast()

  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'list')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [found, setFound] = useState<{ name: string; uuid: string; isFriend: boolean } | null>(null)
  const [removeTarget, setRemoveTarget] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const changeTab = (next: Tab) => {
    setTab(next)
    setParams(next === 'list' ? {} : { tab: next }, { replace: true })
  }

  const search = async () => {
    const uuid = query.trim()
    if (!uuid) return
    setSearching(true)
    setFound(null)
    try {
      setFound(await gateway.searchUser(uuid))
    } catch (cause) {
      toast.show({
        tone: 'warn',
        title: cause instanceof Error ? cause.message : '사용자를 찾지 못했습니다.',
      })
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">친구</h1>
          <p className="page-caption">
            친구가 공개한 만다라트를 구경하고, 서로의 진행을 응원할 수 있어요.
          </p>
          {/* 상대가 나를 추가하려면 이 값이 필요하다. 여기 없으면 마이페이지까지 다녀와야 했다. */}
          <UuidChip className="mt-3 max-w-[290px]" />
        </div>

        <Segmented
          value={tab}
          onChange={changeTab}
          options={[
            { value: 'list', label: `내 친구 ${friends.data.length}` },
            { value: 'search', label: '친구 찾기' },
            {
              value: 'requests',
              label: (
                <span className="flex items-center gap-1.5">
                  받은 요청
                  {requests.data.length > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-brand-500 text-[10px] font-black text-white">
                      {requests.data.length}
                    </span>
                  )}
                </span>
              ),
            },
          ]}
        />
      </header>

      {tab === 'list' &&
        (friends.loading && friends.data.length === 0 ? (
          <Skeleton className="h-[220px] w-full" />
        ) : friends.error ? (
          <ErrorState message={friends.error} onRetry={() => void reloadFriends()} />
        ) : (
          <section className="card">
            {friends.data.length === 0 ? (
              <EmptyState
                icon="👥"
                title="아직 친구가 없어요"
                body="친구의 UUID 로 요청을 보내면, 서로의 공개 만다라트를 볼 수 있어요."
                action={<Button onClick={() => changeTab('search')}>친구 찾기</Button>}
              />
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {friends.data.map((friend, i) => (
                  <li
                    key={friend.relationId}
                    className="flex flex-wrap items-center gap-4 p-5"
                    style={{ borderTop: i === 0 ? undefined : '1px solid var(--border-hairline)' }}
                  >
                    <Avatar name={friend.name} imageUrl={friend.profileImage} size={48} />

                    <div className="min-w-[160px] flex-1">
                      <strong className="block text-[14.5px] font-extrabold">{friend.name}</strong>
                      <p className="muted m-0 mt-0.5 text-[11.5px] font-semibold">
                        {fromNow(friend.createdAt)}부터 친구
                      </p>
                      {/* 앞 8자만 잘라 두면 대조도 복사도 못 한다 — 통째로 두고 복사 버튼을 붙인다. */}
                      <UuidChip value={friend.uuid} className="mt-2 max-w-[320px]" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" to="/app/sheets">
                        공개 만다라트 보기
                      </Button>
                      {/* 삭제 API 는 유저 ID 가 아니라 친구 관계 ID 를 받는다. */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRemoveTarget(friend.relationId)}
                      >
                        삭제
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

      {tab === 'search' && (
        <div className="grid gap-5 md:grid-cols-2">
          <section className="card p-6">
            <h2 className="section-title m-0">UUID 로 찾기</h2>
            <p className="muted m-0 mt-1 text-[12.5px] font-semibold">
              상대의 UUID 를 입력하면 사용자를 찾고 요청을 보낼 수 있어요.
            </p>

            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                void search()
              }}
            >
              <Field label="친구 UUID">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="3f2a9c10-1b4e-4a77-9c2d-8f1e6b0d5a33"
                  aria-label="친구 UUID"
                  spellCheck={false}
                />
              </Field>
              <Button type="submit" disabled={!query.trim() || searching}>
                {searching ? '찾는 중…' : '사용자 찾기'}
              </Button>
            </form>

            {found && (
              <div
                className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl p-4"
                style={{ background: 'var(--surface-sunken)' }}
              >
                <Avatar name={found.name} size={40} />
                <div className="min-w-0 flex-1">
                  <strong className="block text-[13.5px] font-extrabold">{found.name}</strong>
                  <UuidChip value={found.uuid} className="mt-1.5 max-w-[280px]" />
                </div>
                {found.isFriend ? (
                  <Badge tone="success">이미 친구</Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      const ok = await sendFriendRequest(found.uuid)
                      setBusy(false)
                      if (ok) setFound({ ...found, isFriend: false })
                    }}
                  >
                    친구 요청
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'requests' &&
        (requests.loading && requests.data.length === 0 ? (
          <Skeleton className="h-[180px] w-full" />
        ) : requests.error ? (
          <ErrorState message={requests.error} onRetry={() => void reloadFriends()} />
        ) : (
          <section className="card">
            {requests.data.length === 0 ? (
              <EmptyState
                icon="📮"
                title="받은 요청이 없어요"
                body="새 요청이 오면 여기에서 수락하거나 거절할 수 있습니다."
              />
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {requests.data.map((req, i) => (
                  <li
                    key={req.requestId}
                    className="flex flex-wrap items-center gap-4 p-5"
                    style={{ borderTop: i === 0 ? undefined : '1px solid var(--border-hairline)' }}
                  >
                    <Avatar name={req.senderName} imageUrl={req.senderProfileImage} size={44} />
                    <div className="min-w-[140px] flex-1">
                      <strong className="text-[14px] font-extrabold">{req.senderName}</strong>
                      <p className="muted m-0 mt-1 text-[11.5px] font-semibold">
                        {fromNow(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true)
                          await acceptRequest(req.requestId)
                          setBusy(false)
                        }}
                      >
                        수락
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true)
                          await rejectRequest(req.requestId)
                          setBusy(false)
                        }}
                      >
                        거절
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

      <Modal
        open={removeTarget != null}
        onClose={() => setRemoveTarget(null)}
        title="친구를 삭제할까요?"
        description="서로의 목록에서 사라집니다. 다시 추가하려면 UUID 로 요청해야 해요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={async () => {
                if (removeTarget == null) return
                setBusy(true)
                await removeFriend(removeTarget)
                setBusy(false)
                setRemoveTarget(null)
              }}
            >
              삭제하기
            </Button>
          </>
        }
      />
    </div>
  )
}
