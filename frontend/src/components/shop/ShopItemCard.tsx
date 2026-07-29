import type { ShopItem } from './shop.types'

type ShopItemCardProps = {
  item: ShopItem
  canPurchase: boolean
  onPurchase: (item: ShopItem) => void
}

/** 건물 미리보기, 가격과 구매 액션을 표시하는 상점 카드. 한 줄에 6개가 들어가는 크기다. */
export default function ShopItemCard({
  item,
  canPurchase,
  onPurchase,
}: ShopItemCardProps) {
  return (
    <article className="shop-item-card">
      <div className="shop-item-preview" style={{ backgroundColor: item.background }}>
        {/* 테마는 구역 제목으로 이미 드러나므로, 배지는 랜드마크만 따로 알린다. */}
        {item.landmark && <span className="shop-category-badge">랜드마크</span>}
        <span className="shop-item-emoji" aria-hidden="true">{item.thumbnail}</span>
      </div>
      <div className="shop-item-body">
        <h2 className="truncate text-sm font-extrabold" title={item.name}>{item.name}</h2>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs font-extrabold text-points-text">
            <span aria-hidden="true">🪙 </span>
            {item.price.toLocaleString('ko-KR')}P
          </p>
          <button
            type="button"
            disabled={!canPurchase}
            onClick={() => onPurchase(item)}
            className="shop-purchase-button"
          >
            구매
          </button>
        </div>
      </div>
    </article>
  )
}
