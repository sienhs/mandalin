/** 조건에 맞는 CSS 클래스만 공백으로 연결해 React의 className 문자열을 만든다. */
export function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ')
}
