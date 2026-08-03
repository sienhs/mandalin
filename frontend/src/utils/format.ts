export function num(value: number): string {
  return value.toLocaleString('ko-KR')
}

/** 서버 LocalDateTime('2026-06-01T09:00:00') → '2026.06.01' */
export function formatDate(iso: string | null): string {
  if (!iso) return '기한 없음'
  const [date] = iso.split('T')
  return date.replace(/-/g, '.')
}

/** 'YYYY-MM-DD' 형태로 자른다. date input 에 넣을 때 쓴다. */
export function toDateInput(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

/** "3분 전", "어제" 처럼 사람이 읽는 상대 시간. */
export function fromNow(iso: string): string {
  // 서버가 타임존 없는 LocalDateTime 을 주므로 로컬 시간으로 읽는다.
  const time = new Date(iso.includes('Z') ? iso : `${iso}`).getTime()
  if (Number.isNaN(time)) return ''

  const diff = Date.now() - time
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day === 1) return '어제'
  if (day < 7) return `${day}일 전`
  return formatDate(iso)
}
