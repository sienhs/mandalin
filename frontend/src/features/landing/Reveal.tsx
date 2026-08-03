import type { CSSProperties, ReactNode } from 'react'
import { useInView } from './scroll'
import { cn } from '../../utils/cn'

type Variant = 'up' | 'scale' | 'left' | 'right'

/** 나타나기 전 상태. 도착 상태는 언제나 `none` 이라 여기만 다르게 두면 된다. */
const FROM: Record<Variant, string> = {
  up: 'translate3d(0, 34px, 0)',
  scale: 'scale(0.94)',
  left: 'translate3d(-28px, 0, 0)',
  right: 'translate3d(28px, 0, 0)',
}

type Props = {
  children: ReactNode
  variant?: Variant
  /** 같은 줄의 형제들을 조금씩 늦춰 순서대로 올라오게 한다(초 단위). */
  delay?: number
  className?: string
  style?: CSSProperties
}

/**
 * 화면에 들어오면 한 번 나타나는 껍데기.
 *
 * <p>opacity 와 transform 만 건드린다 — 이 둘은 합성 단계에서 처리돼 레이아웃을 다시 계산하지
 * 않는다. height 나 margin 을 애니메이션하면 스크롤 도중 리플로가 나 프레임이 끊긴다.
 *
 * <p>움직임을 끈 사용자에게는 {@link useInView} 가 처음부터 참을 주므로 곧바로 최종 상태다.
 */
export default function Reveal({ children, variant = 'up', delay = 0, className, style }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn('motion-safe:transition-[opacity,transform]', className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : FROM[variant],
        transitionDuration: '760ms',
        transitionTimingFunction: 'var(--ease-out-quint)',
        transitionDelay: inView ? `${delay}s` : '0s',
        // 나타나는 동안만 합성 레이어로 올린다. 끝난 뒤에도 물고 있으면 메모리만 먹는다.
        willChange: inView ? undefined : 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
