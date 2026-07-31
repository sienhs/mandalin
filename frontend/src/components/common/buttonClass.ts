import { cn } from '../../utils/cn'
import '../../styles/button.css'

/** primary = 주요 동작, danger = 경고를 동반한 동작, ghost = 취소 */
export type ButtonVariant = 'primary' | 'danger' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type ButtonShape = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

/**
 * 공통 버튼의 모양 클래스.
 * <button> 이면 Button 컴포넌트를 쓰고, <Link> 처럼 다른 요소를 버튼처럼
 * 보이게 할 때만 이 함수를 직접 쓴다.
 */
export function buttonClass({ variant = 'primary', size = 'md', className }: ButtonShape = {}) {
  return cn('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, className)
}
