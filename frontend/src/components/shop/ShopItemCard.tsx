import type { ShopItem } from './shop.types'

type ShopItemCardProps = {
  item: ShopItem
  canPurchase: boolean
  onPurchase: (item: ShopItem) => void
}

/** 건물 미리보기, 분류, 가격과 구매 액션을 표시하는 상점 카드. */
export default function ShopItemCard({
  item,
  canPurchase,
  onPurchase,
}: ShopItemCardProps) {
  return (
    <article className="shop-item-card">
      <div className="shop-item-preview" style={{ backgroundColor: item.background }}>
        <span className="shop-category-badge">{item.category}</span>
        <span className="text-5xl" aria-hidden="true">{item.thumbnail}</span>
      </div>
      <div className="flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold">{item.name}</h2>
          <p className="mt-3 text-sm font-extrabold text-points-text">
            <span aria-hidden="true">🪙 </span>
            {item.price.toLocaleString('ko-KR')}P
          </p>
        </div>
        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => onPurchase(item)}
          className="shop-purchase-button"
        >
          구매
        </button>
      </div>
    </article>
  )
}
