import { useEffect } from 'react'
import type { ShopItem } from './shop.types'

type PurchaseStep = 'confirm' | 'complete'

type ShopPurchaseModalProps = {
  item: ShopItem
  point: number
  step: PurchaseStep
  onConfirm: () => void
  onClose: () => void
}

/** 건물 구매 확인과 구매 완료 상태를 순서대로 보여주는 상점 모달. */
export default function ShopPurchaseModal({
  item,
  point,
  step,
  onConfirm,
  onClose,
}: ShopPurchaseModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="shop-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="shop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-modal-title"
      >
        <div
          className="shop-modal-preview"
          style={{ backgroundColor: item.background }}
        >
          <button
            type="button"
            className="shop-modal-close"
            onClick={onClose}
            aria-label="구매 창 닫기"
          >
            ×
          </button>
          <span className="text-6xl" aria-hidden="true">{item.thumbnail}</span>
        </div>

        {step === 'confirm' ? (
          <div className="px-7 py-6 sm:px-9">
            <h2 id="shop-modal-title" className="text-center text-lg font-extrabold">
              이 건물을 구매하시겠어요?
            </h2>
            <p className="mt-2 text-center text-sm font-bold text-slate-400">
              {item.name}
            </p>

            <dl className="shop-purchase-summary">
              <div className="mb-6 flex items-center justify-between text-lg font-extrabold">
                <dt className="text-text-muted">건물 가격</dt>
                <dd className="m-0 text-points-text">
                  🪙 {item.price.toLocaleString('ko-KR')}P
                </dd>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <dt className="text-text-muted">보유 포인트</dt>
                <dd className="m-0 text-points-text">
                  🪙 {point.toLocaleString('ko-KR')}P
                </dd>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-extrabold">
                <dt>구매 후 잔액</dt>
                <dd className="m-0 text-points-text">
                  🪙 {(point - item.price).toLocaleString('ko-KR')}P
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-2 gap-5">
              <button type="button" onClick={onConfirm} className="shop-confirm-button">
                예
              </button>
              <button type="button" onClick={onClose} className="shop-cancel-button">
                아니오
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center px-7 py-10 text-center">
            <h2 id="shop-modal-title" className="text-lg font-extrabold">구매 완료</h2>
            <p className="mt-8 text-sm font-bold text-slate-400">
              설치 가능한 목록에 추가되었어요
            </p>
            <div
              className="mt-10 grid size-20 place-items-center rounded-full border-[3px] border-success text-4xl font-black text-success"
              aria-hidden="true"
            >
              ✓
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
