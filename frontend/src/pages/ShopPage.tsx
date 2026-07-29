import { useEffect, useMemo, useState } from 'react'
import Header from '../components/common/Header'
import ShopItemCard from '../components/shop/ShopItemCard'
import ShopPurchaseModal from '../components/shop/ShopPurchaseModal'
import { fetchShopItems, purchaseShopItem } from '../components/shop/shop.api'
import { SHOP_CATEGORIES } from '../components/shop/shop.data'
import type { ShopCategory, ShopItem } from '../components/shop/shop.types'
import { useAuth } from '../contexts/auth'
import { cn } from '../utils/cn'
import '../styles/shop.css'

type ShopPageProps = {
  initialItems?: ShopItem[]
}

const ITEMS_PER_PAGE = 8

/** 건물 아이템을 분류별로 확인하고 포인트로 구매하는 상점 페이지. */
export default function ShopPage({ initialItems }: ShopPageProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<ShopItem[]>(initialItems ?? [])
  const [category, setCategory] = useState<ShopCategory>('전체')
  const [page, setPage] = useState(1)
  const [point, setPoint] = useState(user?.point ?? 0)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [purchaseStep, setPurchaseStep] = useState<'confirm' | 'complete'>('confirm')
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const filteredItems = useMemo(
    () => category === '전체'
      ? items
      : items.filter((item) => item.category === category),
    [category, items],
  )
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  const visibleItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  useEffect(() => setPage(1), [category])

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

        <div className="mt-5 flex flex-wrap gap-2" aria-label="건물 분류">
          {SHOP_CATEGORIES.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setCategory(value)}
              className={cn(
                'shop-filter-button',
                category === value && 'shop-filter-button-active',
              )}
            >
              {value}
            </button>
          ))}
        </div>

        {error && (
          <p className="shop-empty mt-5" role="alert">{error}</p>
        )}

        {visibleItems.length > 0 ? (
          <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                canPurchase={point >= item.price}
                onPurchase={purchase}
              />
            ))}
          </section>
        ) : (
          <section className="shop-empty">
            등록된 건물이 없습니다.
          </section>
        )}

        {filteredItems.length > 0 && (
          <nav className="shop-pagination" aria-label="상점 페이지">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setPage(value)}
              className={cn(page === value && 'shop-page-active')}
            >
              {value}
            </button>
          ))}
          <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </nav>
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
