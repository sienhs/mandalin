import { useEffect, type ReactNode } from 'react'
import Button from '../common/Button'
import { cn } from '../../utils/cn'

type SheetListDialogProps = {
  labelledBy?: string
  /** 카드에 덧붙일 클래스. 폭·정렬·여백을 팝업별로 지정한다. */
  className?: string
  onClose: () => void
  children: ReactNode
}

/**
 * 목록 화면 팝업이 공유하는 오버레이.
 * 배경 클릭과 Esc 로 닫힌다.
 */
export default function SheetListDialog({
  labelledBy,
  className,
  onClose,
  children,
}: SheetListDialogProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="sheet-list-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      // 카드 내부 클릭이 올라와 닫히지 않도록 대상이 오버레이 자신일 때만 닫는다.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={cn('sheet-list-dialog', className)}>{children}</div>
    </div>
  )
}

type SheetListConfirmDialogProps = {
  /** 제목 요소의 id. 오버레이의 aria-labelledby 와 연결한다. */
  titleId: string
  icon: string
  /** 아이콘 원의 색 변형 */
  tone: 'mint' | 'danger'
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

/** 아이콘 · 제목 · 설명 · [확인/취소] 로 이루어진 확인 팝업 */
export function SheetListConfirmDialog({
  titleId,
  icon,
  tone,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: SheetListConfirmDialogProps) {
  return (
    <SheetListDialog labelledBy={titleId} className="sheet-list-dialog--confirm" onClose={onClose}>
      <span className={cn('sheet-list-dialog-icon', `sheet-list-dialog-icon--${tone}`)} aria-hidden="true">
        {icon}
      </span>

      <h2 id={titleId} className="sheet-list-dialog-title">
        {title}
      </h2>
      <p className="sheet-list-dialog-desc">{description}</p>

      <div className="sheet-list-dialog-actions">
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          size="lg"
          onClick={onConfirm}
          className="ui-btn--modal"
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" size="lg" onClick={onClose} className="ui-btn--modal">
          취소
        </Button>
      </div>
    </SheetListDialog>
  )
}
