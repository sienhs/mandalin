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

    // 상품 조회 API 호출부: 실제 요청 구현은 components/shop/shop.api.ts에서 교체한다.
    void fetchShopItems().then(setItems)
  }, [initialItems])

  useEffect(() => {
    setPoint(user?.point ?? 0)
  }, [user?.point])

  const purchase = (item: ShopItem) => {
    if (point < item.price) return
    setSelectedItem(item)
    setPurchaseStep('confirm')
  }

  const confirmPurchase = async () => {
    if (!selectedItem || point < selectedItem.price) return
    /**
     * 구매 API 호출부.
     *
     * 현재 purchaseShopItem은 API 연결 위치만 표시한 임시 함수라 반환값이 없다.
     * 백엔드 구매 API 연결 후에는 서버가 반환한 remainingPoint를 사용해
     * `setPoint(result.remainingPoint)`로 변경해야 한다.
     * 요청이 실패하면 아래 완료 화면으로 넘어가지 않도록 예외 처리도 이 위치에 추가한다.
     */
    await purchaseShopItem(selectedItem.id)
    setPoint((current) => current - selectedItem.price)
    setPurchaseStep('complete')
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
