import type { ButtonHTMLAttributes } from 'react'
import { buttonClass, type ButtonShape } from './buttonClass'

type ButtonProps = ButtonShape & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * 생성 화면 · 목록 화면이 공유하는 버튼.
 * 폭(w-full / flex-1)처럼 배치에 관한 값은 className 으로 덧붙인다.
 */
export default function Button({
  variant,
  size,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...rest} />
}
