import type { ReactNode } from 'react'

/** 확인 팝업의 보조 버튼(계속 편집하기 · 나가기)에 공통으로 쓰는 클래스 */
export const DIALOG_GHOST_BUTTON =
  'btn flex-1 rounded-xl border border-[#cbd5e1] bg-white text-[15px] font-bold text-ink-500 hover:bg-[#f4f5f9]'

type SheetDialogProps = {
  labelledBy?: string
  children: ReactNode
}

/** 모든 팝업이 공유하는 반투명 오버레이 */
export default function SheetDialog({ labelledBy, children }: SheetDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      {children}
    </div>
  )
}

type SheetConfirmDialogProps = {
  /** 제목 요소의 id. 오버레이의 aria-labelledby와 연결한다. */
  titleId: string
  icon: string
  /** 아이콘 원의 배경색 클래스 */
  iconClass: string
  title: string
  description: ReactNode
  /** 하단 버튼들 */
  children: ReactNode
}

/** 아이콘 · 제목 · 설명 · 버튼으로 이루어진 확인 팝업 */
export function SheetConfirmDialog({
  titleId,
  icon,
  iconClass,
  title,
  description,
  children,
}: SheetConfirmDialogProps) {
  return (
    <SheetDialog labelledBy={titleId}>
      <div className="flex w-[380px] flex-col items-center gap-5 rounded-[24px] bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${iconClass}`}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="m-0 text-lg font-extrabold text-ink-900">
            {title}
          </h2>
          <p className="m-0 text-[14px] leading-relaxed text-ink-500">{description}</p>
        </div>
        {children}
      </div>
    </SheetDialog>
  )
}
