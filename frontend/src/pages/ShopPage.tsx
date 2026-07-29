import { useEffect, useMemo, useState } from 'react'
import Header from '../components/common/Header'
import ShopItemCard from '../components/shop/ShopItemCard'
import ShopPurchaseModal from '../components/shop/ShopPurchaseModal'
import { fetchShopItems, groupByTheme, purchaseShopItem } from '../components/shop/shop.api'
import type { ShopItem } from '../components/shop/shop.types'
import { useAuth } from '../contexts/auth'
import { cn } from '../utils/cn'
import '../styles/shop.css'

type ShopPageProps = {
  initialItems?: ShopItem[]
}

/** 테마 필터의 "전체" 값. 실제 테마 키(BASIC 등)와 겹치지 않게 소문자로 둔다. */
const ALL_THEMES = 'all'

/**
 * 건물 아이템을 테마별로 확인하고 포인트로 구매하는 상점 페이지.
 *
 * 페이지네이션을 쓰지 않는다. 건물이 200종이 넘어 페이지 번호가 수십 개로 늘어나던 것을,
 * 테마별 구역으로 나눠 스크롤로 훑도록 바꿨다.
 */
export default function ShopPage({ initialItems }: ShopPageProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<ShopItem[]>(initialItems ?? [])
  const [theme, setTheme] = useState<string>(ALL_THEMES)
  const [point, setPoint] = useState(user?.point ?? 0)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [purchaseStep, setPurchaseStep] = useState<'confirm' | 'complete'>('confirm')
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  // 필터 버튼은 실제 목록에서 만든다. 건물을 다 사서 어떤 테마가 비면 그 버튼도 사라진다.
  const groups = useMemo(() => groupByTheme(items), [items])
  const visibleGroups = useMemo(
    () => (theme === ALL_THEMES ? groups : groups.filter((group) => group.theme === theme)),
    [groups, theme],
  )

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems)
      return
    }

    void fetchShopItems()
      .then(setItems)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : '건물 목록을 불러오지 못했습니다.')
      })
  }, [initialItems])

  useEffect(() => {
    setPoint(user?.point ?? 0)
  }, [user?.point])

  // 고른 테마의 건물을 다 사면 그 테마가 사라진다. 빈 화면에 남지 않게 전체로 되돌린다.
  useEffect(() => {
    if (theme !== ALL_THEMES && !groups.some((group) => group.theme === theme)) {
      setTheme(ALL_THEMES)
    }
  }, [groups, theme])

  const purchase = (item: ShopItem) => {
    if (point < item.price) return
    setError(null)
    setSelectedItem(item)
    setPurchaseStep('confirm')
  }

  const confirmPurchase = async () => {
    if (!selectedItem || point < selectedItem.price || purchasing) return

    setPurchasing(true)
    try {
      const result = await purchaseShopItem(selectedItem.id)
      // 화면에서 `잔액 - 가격`으로 계산하지 않는다. 다른 탭에서 동시에 구매했거나 서버
      // 가격이 바뀌었을 수 있어, 서버가 확정한 잔액만 신뢰한다.
      setPoint(result.remainingPoint)
      // 산 건물은 더 이상 판매 대상이 아니다.
      setItems((current) => current.filter((item) => item.id !== result.itemId))
      setPurchaseStep('complete')
    } catch (cause: unknown) {
      // 실패했으면 완료 화면으로 넘기지 않는다 — 안 산 건물을 샀다고 보여주게 된다.
      setError(cause instanceof Error ? cause.message : '구매에 실패했습니다.')
      setSelectedItem(null)
    } finally {
      setPurchasing(false)
    }
  }

  const closePurchaseModal = () => {
    setSelectedItem(null)
    setPurchaseStep('confirm')
  }

  return (
    <div className="page-shell">
      <Header fallbackPoint={point} />
      <main className="shop-main">
        <h1 className="text-2xl font-extrabold tracking-[-0.04em]">건물 상점</h1>
        <p className="subtitle">포인트로 도시를 꾸밀 건물을 구매해 보세요</p>

        <div className="shop-filter-bar" aria-label="테마 분류">
          <button
            type="button"
            onClick={() => setTheme(ALL_THEMES)}
            className={cn(
              'shop-filter-button',
              theme === ALL_THEMES && 'shop-filter-button-active',
            )}
          >
            전체 <span className="shop-filter-count">{items.length}</span>
          </button>
          {groups.map((group) => (
            <button
              type="button"
              key={group.theme}
              onClick={() => setTheme(group.theme)}
              className={cn(
                'shop-filter-button',
                theme === group.theme && 'shop-filter-button-active',
              )}
            >
              {group.label} <span className="shop-filter-count">{group.items.length}</span>
            </button>
          ))}
        </div>

        {error && <p className="shop-empty" role="alert">{error}</p>}

        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <section key={group.theme} className="shop-theme-section">
              <h2 className="shop-theme-heading">
                {group.label}
                <span className="shop-theme-count">{group.items.length}개</span>
              </h2>
              <div className="shop-item-grid">
                {group.items.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    canPurchase={point >= item.price}
                    onPurchase={purchase}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          !error && <section className="shop-empty">등록된 건물이 없습니다.</section>
        )}
      </main>

      {selectedItem && (
        <ShopPurchaseModal
          item={selectedItem}
          point={point}
          step={purchaseStep}
          onConfirm={confirmPurchase}
          onClose={closePurchaseModal}
        />
      )}
    </div>
  )
}
