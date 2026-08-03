import { cn } from '../../utils/cn'

/**
 * 만다린 심볼 — 막대 네 줄을 90°씩 돌려 만든 만다라.
 *
 * <p>원본(`public/brand/logo.svg`)을 인라인으로 옮겨 왔다. `<img>` 로 불러오면 색을 바꿀 수
 * 없어서 붉은 로그인 패널 위에서는 원색 오렌지가 배경과 부딪힌다. 인라인이면
 * {@code currentColor} 를 타므로 놓이는 자리에 맞춰 색이 따라온다 — 흰 배경에서는 브랜드색,
 * 컬러 배경 위에서는 흰색.
 *
 * <p>네 겹의 투명도(1 / .82 / .62 / .44)가 이 심볼의 정체성이라 그대로 둔다. 회전하며
 * 옅어지는 것이 "핵심 목표에서 과제로 퍼져 나간다"는 만다라트의 구조를 나타낸다.
 */

/** 한 겹의 막대 네 개. 나머지 세 겹은 이걸 90°씩 돌려 쓴다. */
function Blades() {
  return (
    <>
      <rect x="36" y="4" width="22" height="6" rx="3" />
      <rect x="45" y="12" width="13" height="6" rx="3" />
      <rect x="36" y="20" width="18" height="6" rx="3" />
      <rect x="48" y="27" width="10" height="6" rx="3" />
    </>
  )
}

export default function Logo({
  className,
  /**
   * 네 겹의 투명도를 없애고 단색으로 그린다.
   *
   * <p>투명도 단계는 <b>밝은 배경</b>을 전제로 만들어졌다 — 옅어질수록 흰 종이가 비쳐
   * 연한 주황이 된다. 색이 있는 배경(로그인의 붉은 패널) 위에서는 옅은 겹이 배경에
   * 그대로 묻혀, 작은 크기에서는 막대들이 뭉쳐 무슨 모양인지 알아볼 수 없다.
   * 그런 자리에서는 이걸 켜서 또렷한 한 색으로 찍는다.
   */
  flat = false,
}: {
  className?: string
  flat?: boolean
}) {
  const fade = (value: number) => (flat ? undefined : value)

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('block', className)}
      fill="currentColor"
      role="img"
      aria-label="만다린"
    >
      <Blades />
      <g transform="rotate(90 32 32)" opacity={fade(0.82)}>
        <Blades />
      </g>
      <g transform="rotate(180 32 32)" opacity={fade(0.62)}>
        <Blades />
      </g>
      <g transform="rotate(270 32 32)" opacity={fade(0.44)}>
        <Blades />
      </g>
    </svg>
  )
}

/**
 * 심볼 + 글자를 함께 쓰는 기본 조합. 헤더마다 같은 마크업을 베껴 쓰다 보면
 * 크기와 간격이 조금씩 어긋나므로 한곳에 둔다.
 */
export function LogoLockup({
  size = 'md',
  className,
  /** 글자를 감춘다(좁은 화면 등). 심볼만 남는다. */
  symbolOnly = false,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  symbolOnly?: boolean
}) {
  const symbol = { sm: 'size-6', md: 'size-8', lg: 'size-9' }[size]
  const word = { sm: 'text-[13px]', md: 'text-[17px]', lg: 'text-xl' }[size]

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Logo className={cn(symbol, 'shrink-0 text-brand-500')} />
      {!symbolOnly && (
        <strong className={cn('font-black tracking-[-0.04em]', word)}>만다린</strong>
      )}
    </span>
  )
}
