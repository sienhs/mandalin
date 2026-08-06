import { useMemo, useState } from 'react'
import { useStore } from '../data/store'
import type { ShopItem } from '../data/types'
import Button from '../components/common/ActionButton'
import Modal from '../components/common/Modal'
import { IconCheck } from '../components/common/Icons'
import { Badge, EmptyState, ErrorState, Segmented, Skeleton } from '../components/common/Primitives'
import { ThemeCorner } from '../components/shop/ThemeCorner'
import { BuildingImage } from '../village/BuildingImage'
import { themeLabel } from '../village/ownedCatalog'
import { num } from '../utils/format'
import { cn } from '../utils/cn'

/**
 * 상점 카드의 건물 그림.
 *
 * <p>이미지는 {@link BuildingImage} 가 서버 → S3 → 로컬 순으로 찾는다. 상점 응답에는
 * 3D `parts` 가 없어 라이브 베이킹은 못 하므로, 전부 실패하면 아래 실루엣으로 떨어진다.
 * 랜드마크는 성장 단계가 8까지라 완성 단계를 보여준다.
 */
function Preview({ item, size = 72 }: { item: ShopItem; size?: number }) {
  return (
    <BuildingImage
      k={item.itemKey}
      remoteUrl={item.thumbnailUrl}
      size={size}
      alt={item.name}
      landmark={item.type === 'LANDMARK'}
      fallback={<Silhouette item={item} />}
    />
  )
}

/** 그림을 못 구했을 때 쓰는 실루엣. itemKey 로 형태를 정해 같은 건물은 늘 같게 보이도록 한다. */
function Silhouette({ item }: { item: ShopItem }) {
  const shapes = ['tower', 'house', 'dome', 'spire', 'block', 'garden'] as const
  const hash = item.itemKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const shape = item.type === 'LANDMARK' ? 'tower' : shapes[hash % shapes.length]
  const color = item.owned ? '#2f9e44' : '#e8590c'

  const body = {
    tower: (
      <>
        <rect x="26" y="20" width="20" height="42" rx="2" fill={color} />
        <rect x="30" y="10" width="12" height="12" rx="2" fill={color} opacity=".7" />
      </>
    ),
    house: (
      <>
        <rect x="20" y="34" width="32" height="28" rx="2" fill={color} />
        <path d="M16 34 36 16l20 18Z" fill={color} opacity=".7" />
      </>
    ),
    dome: (
      <>
        <rect x="22" y="42" width="28" height="20" rx="2" fill={color} />
        <path d="M22 42a14 14 0 0 1 28 0Z" fill={color} opacity=".7" />
      </>
    ),
    spire: (
      <>
        <rect x="28" y="34" width="16" height="28" rx="2" fill={color} />
        <path d="M36 10 46 36H26Z" fill={color} opacity=".7" />
      </>
    ),
    block: (
      <>
        <rect x="16" y="30" width="18" height="32" rx="2" fill={color} />
        <rect x="38" y="40" width="18" height="22" rx="2" fill={color} opacity=".7" />
      </>
    ),
    garden: (
      <>
        <rect x="18" y="50" width="36" height="12" rx="3" fill={color} />
        <circle cx="30" cy="40" r="10" fill={color} opacity=".7" />
        <circle cx="46" cy="44" r="7" fill={color} opacity=".5" />
      </>
    ),
  }[shape]

  return (
    <svg viewBox="0 0 72 72" className="size-full" aria-hidden="true">
      <rect width="72" height="72" rx="14" className="fill-[var(--surface-sunken)]" />
      {body}
    </svg>
  )
}

export default function Shop() {
  const { shop, user, purchase, reloadShop } = useStore()
  const [theme, setTheme] = useState('all')
  const [ownership, setOwnership] = useState<'all' | 'unowned' | 'owned'>('all')
  const [target, setTarget] = useState<ShopItem | null>(null)
  const [busy, setBusy] = useState(false)

  const themes = useMemo(
    () => ['all', ...Array.from(new Set(shop.data.map((i) => i.theme)))],
    [shop.data],
  )

  /**
   * 두 필터를 겹쳐 적용한다.
   *
   * <p>보유 여부를 <b>정렬</b>이 아니라 필터로 둔 이유는, 정렬로 하면 미보유가 뒤로 밀릴 뿐
   * 목록 길이는 그대로라 256개를 계속 스크롤해야 하기 때문이다. 기본값 '전체'는 둘을 섞어
   * 보여주므로 "같이 보고 싶다"는 쪽도 그대로 만족한다.
   */
  const visible = useMemo(
    () =>
      shop.data.filter(
        (i) =>
          (theme === 'all' || i.theme === theme) &&
          (ownership === 'all' || (ownership === 'owned' ? i.owned : !i.owned)),
      ),
    [shop.data, theme, ownership],
  )

  const ownedCount = shop.data.filter((i) => i.owned).length
  const point = user?.point ?? 0

  /*
    개수는 테마 필터를 반영해서 센다. '벚꽃'을 고른 채 '미보유 0'이 보이면
    그 테마를 다 모았다는 뜻이 되어야지, 전체 기준 숫자가 뜨면 읽는 사람이 헷갈린다.
  */
  const inTheme = useMemo(
    () => (theme === 'all' ? shop.data : shop.data.filter((i) => i.theme === theme)),
    [shop.data, theme],
  )
  const ownedInTheme = inTheme.filter((i) => i.owned).length

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">상점</h1>
          <p className="page-caption">
            과제를 완료해 모은 포인트로 건물을 사고, 내 마을에 세울 수 있어요.
          </p>
        </div>

        <div
          className="flex items-center gap-4 rounded-2xl border px-5 py-3.5"
          style={{
            borderColor: 'var(--border-hairline)',
            background: 'var(--surface-card)',
          }}
        >
          <div>
            <span className="muted block text-[11.5px] font-bold">보유 포인트</span>
            <strong className="text-xl font-black tracking-[-0.03em] text-brand-600 dark:text-brand-400">
              {num(point)}P
            </strong>
          </div>
          <div
            className="h-9 w-px"
            style={{ background: 'var(--border-hairline)' }}
            aria-hidden="true"
          />
          <div>
            <span className="muted block text-[11.5px] font-bold">보유 건물</span>
            <strong className="text-xl font-black tracking-[-0.03em]">
              {ownedCount}
              <span className="muted text-sm">/{shop.data.length}</span>
            </strong>
          </div>
        </div>
      </header>

      {shop.loading && shop.data.length === 0 ? (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-[228px] w-full" />
            </li>
          ))}
        </ul>
      ) : shop.error ? (
        <ErrorState message={shop.error} onRetry={() => void reloadShop()} />
      ) : shop.data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="🏪"
            title="상점이 비어 있어요"
            body="서버에 등록된 건물이 없습니다. 백엔드 건물 카탈로그 시드를 확인해 주세요."
          />
        </div>
      ) : (
        <>
          <Segmented
            value={theme}
            onChange={setTheme}
            options={themes.map((t) => ({
              value: t,
              label: t === 'all' ? '전체' : themeLabel(t),
            }))}
            className="max-w-full flex-wrap"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              value={ownership}
              onChange={(v) => setOwnership(v as 'all' | 'unowned' | 'owned')}
              options={[
                { value: 'all', label: `전체 ${inTheme.length}` },
                {
                  value: 'unowned',
                  label: `미보유 ${inTheme.length - ownedInTheme}`,
                },
                { value: 'owned', label: `보유 ${ownedInTheme}` },
              ]}
              className="self-start"
            />
            <p className="muted m-0 text-[12px] font-semibold">{visible.length}개 표시 중</p>
          </div>

          {/*
            필터를 겹치면 결과가 0개가 될 수 있다(예: 한 테마를 다 모은 뒤 '미보유').
            빈 <ul>만 남으면 목록이 깨진 것처럼 보이므로 이유를 적어 준다.
          */}
          {visible.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={ownership === 'owned' ? '🏗️' : '🎉'}
                title={
                  ownership === 'owned'
                    ? '아직 보유한 건물이 없어요'
                    : '이 조건의 건물을 모두 모았어요'
                }
                body={
                  ownership === 'owned'
                    ? '포인트를 모아 첫 건물을 구매해 보세요.'
                    : '다른 테마를 둘러보거나 전체 보기로 확인해 보세요.'
                }
              />
            </div>
          ) : (
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item, i) => {
                const affordable = point >= item.price
                return (
                  <li
                    key={item.itemId}
                    className="animate-rise"
                    style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}
                  >
                    {/*
                      relative + overflow-hidden 이 있어야 코너 장식이 카드 모서리를
                      따라 잘린다. 없으면 둥근 모서리 밖으로 삐져나온다.
                    */}
                    <article className="card relative flex h-full flex-col overflow-hidden p-5">
                      <ThemeCorner theme={item.theme} />

                      {/* 장식 위에 얹혀야 글자와 그림이 가려지지 않는다. */}
                      <div className="relative mb-4 size-[72px]">
                        <Preview item={item} />
                      </div>

                      <div className="relative flex items-start justify-between gap-2">
                        <h2 className="m-0 text-[14.5px] font-extrabold tracking-[-0.025em]">
                          {item.name}
                        </h2>
                        {item.owned ? (
                          <Badge tone="success">보유</Badge>
                        ) : item.type === 'LANDMARK' ? (
                          <Badge tone="brand">랜드마크</Badge>
                        ) : null}
                      </div>
                      <p className="muted relative m-0 mt-1 text-[11.5px] font-bold">
                        {themeLabel(item.theme)}
                      </p>

                      <div className="relative mt-auto pt-5">
                        {item.owned ? (
                          <Button
                            variant="quiet"
                            size="sm"
                            full
                            to="/app/village"
                            state={{ from: '/app/shop' }}
                          >
                            <IconCheck className="size-4" /> 마을에서 보기
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            full
                            variant={affordable ? 'primary' : 'secondary'}
                            onClick={() => setTarget(item)}
                          >
                            {num(item.price)}P{!affordable && ' · 부족'}
                          </Button>
                        )}
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={`${target?.name ?? ''}을(를) 구매할까요?`}
        description={
          target
            ? `${num(target.price)}P가 차감됩니다. 구매 후 남는 포인트는 ${num(Math.max(0, point - target.price))}P예요.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTarget(null)}>
              취소
            </Button>
            <Button
              size="sm"
              disabled={!target || point < target.price || busy}
              onClick={async () => {
                if (!target) return
                setBusy(true)
                await purchase(target)
                setBusy(false)
                setTarget(null)
              }}
            >
              {busy ? '구매 중…' : '구매하기'}
            </Button>
          </>
        }
      >
        {target && (
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0">
              <Preview item={target} size={80} />
            </div>
            <div>
              <p className="m-0 text-[14px] font-extrabold">{target.name}</p>
              <p className="muted m-0 mt-1 text-[12.5px] font-semibold">
                {themeLabel(target.theme)} · {num(target.price)}P
              </p>
              <p
                className={cn(
                  'm-0 mt-2 text-[12.5px] font-bold',
                  point >= target.price ? 'text-emerald-600' : 'text-amber-600',
                )}
              >
                {point >= target.price
                  ? '지금 구매할 수 있어요'
                  : `${num(target.price - point)}P가 모자라요`}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
