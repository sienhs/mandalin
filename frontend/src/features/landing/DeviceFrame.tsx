import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/**
 * 소개 페이지가 제품 화면을 담는 액자.
 *
 * <p>액자가 필요한 이유는 장식이 아니다. 랜딩의 배경과 제품 화면은 같은 토큰(같은 흰색,
 * 같은 회색)을 쓰기 때문에, 테두리가 없으면 어디까지가 소개 글이고 어디부터가 앱 화면인지
 * 구분되지 않는다. 창틀을 씌우면 "이건 실제 화면이다"가 설명 없이 읽힌다.
 */

export function BrowserFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('overflow-hidden rounded-[18px] border', className)}
      style={{
        borderColor: 'var(--border-hairline)',
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-pop)',
      }}
    >
      {/*
        창 상단 바. 주소는 적지 않는다 — 액자가 할 일은 "여기부터 앱 화면" 이라는 경계를
        긋는 것뿐이고, 주소를 적으면 그 경로가 진짜인지 매번 실제 앱과 맞춰야 한다.
        신호등 세 점만으로도 창이라는 것은 충분히 읽힌다.
      */}
      <div
        className="flex items-center gap-2 border-b px-3.5 py-2.5"
        style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-sunken)' }}
      >
        <span className="flex gap-1.5" aria-hidden="true">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="size-[9px] rounded-full" style={{ background: c }} />
          ))}
        </span>
      </div>

      {/*
        text-left 을 여기서 못 박는다. 소개 페이지의 여러 절이 text-center 로 가운데
        정렬을 걸어 두는데, 그 정렬이 액자 안 제품 화면까지 상속되면 실제 앱에서는
        왼쪽 정렬인 카드 제목이 가운데로 몰려 "실제 화면"이 아니게 된다.
      */}
      <div className="text-left" style={{ background: 'var(--surface-page)' }}>
        {children}
      </div>
    </div>
  )
}

