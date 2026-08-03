import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * 소개 페이지의 스크롤 연출 두 가지.
 *
 * <p>토스 랜딩의 움직임은 결국 이 둘로 환원된다 — <b>화면에 들어오면 한 번 나타나기</b>와
 * <b>구간을 지나는 동안 0→1 로 변하기</b>. 라이브러리를 붙이지 않고 이 파일 하나로 끝낸다.
 * 번들에 애니메이션 엔진(framer-motion 등)을 얹으면 랜딩 하나 때문에 앱 전체가 무거워진다.
 *
 * <p>둘 다 {@code prefers-reduced-motion} 을 존중한다. 이 페이지는 움직임이 내용을 나르는
 * 구조라(스크롤해야 글이 보인다) 애니메이션을 끄면 <b>즉시 최종 상태</b>로 둬야 한다.
 * CSS 의 전역 reduce 규칙은 재생 시간만 0 으로 만들 뿐, 관찰자가 켜 주지 않은 요소는
 * 영영 opacity:0 으로 남는다 — 내용이 통째로 사라진다.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 미디어 쿼리 일치 여부.
 *
 * <p>`hidden lg:block` 으로 가르면 안 보이는 쪽도 <b>마운트는 된다</b> — 이 페이지는 양쪽
 * 가지에 81칸 격자와 3D 마을이 들어 있어서, 보이지도 않는 SVG 수천 개를 매번 그리게 된다.
 * 그래서 CSS 가 아니라 여기서 갈라 한쪽만 렌더한다.
 *
 * <p>첫 렌더부터 실제 값으로 시작한다. false 로 시작하면 큰 화면에서도 모바일 배치가
 * 한 프레임 스쳐 지나가고, 그 사이 무거운 쪽이 마운트됐다 버려진다.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * 요소가 화면에 들어왔는지. 한 번 들어오면 계속 참으로 둔다 —
 * 스크롤을 되감을 때마다 다시 사라졌다 나타나면 읽던 자리를 잃는다.
 *
 * @param rootMargin 아래쪽을 음수로 줄여 "조금 더 올라온 뒤"에 켜지게 한다.
 *                   0 으로 두면 글자 한 줄이 걸치자마자 시작해 성급해 보인다.
 */
export function useInView<T extends HTMLElement>(
  rootMargin = '0px 0px -14% 0px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (prefersReducedMotion()) {
      setInView(true)
      return
    }
    const node = ref.current
    if (!node) return

    // 지원하지 않는 환경(구형 브라우저)에서는 숨긴 채로 두지 않는다.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    /*
      아래를 깎아 둔 만큼(rootMargin) 화면 바닥에 <b>영영 닿지 않는 띠</b>가 생긴다.
      문서 끝에 있는 요소(푸터)는 끝까지 스크롤해도 그 띠를 벗어나지 못해 계속 숨은 채로
      남는다 — 실제로 푸터의 팀 이름이 통째로 보이지 않았다.

      그래서 마운트 시점에 "문서 끝까지 남은 거리"를 한 번 재고, 그 띠보다 가까우면
      깎지 않은 영역으로 관찰한다. 스크롤 리스너를 더 붙이지 않고 측정 한 번으로 끝난다.
    */
    const deadZone = window.innerHeight * 0.14
    const bottomFromDocEnd =
      document.documentElement.scrollHeight -
      (window.scrollY + node.getBoundingClientRect().bottom)
    const margin = bottomFromDocEnd < deadZone ? '0px' : rootMargin

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return [ref, inView]
}

/**
 * 요소가 화면을 지나가는 진행도(0~1).
 *
 * <p>0 = 요소 위쪽이 화면 바닥에 막 닿은 순간, 1 = 요소 아래쪽이 화면 꼭대기를 지난 순간.
 * 고정(sticky) 구간에서 "스크롤한 만큼" 장면을 바꾸는 데 쓴다.
 *
 * <p>스크롤 이벤트마다 setState 를 부르면 리렌더가 스크롤을 따라잡지 못한다.
 * rAF 로 프레임당 한 번만 계산하고, 값이 실제로 변했을 때만 상태를 올린다.
 */
export function useScrollProgress<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)
  const frame = useRef<number | null>(null)
  const last = useRef(-1)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const node = ref.current
    if (!node) return

    const measure = () => {
      frame.current = null
      const rect = node.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      // 요소가 화면보다 길 때를 기준으로 삼는다. 짧으면 분모가 0 이하가 되어 튄다.
      const span = rect.height - viewport
      const raw = span > 0 ? -rect.top / span : -rect.top / viewport
      const next = Math.max(0, Math.min(1, raw))
      // 소수점 셋째 자리까지만 본다 — 그 아래는 화면에서 구분되지 않는데 리렌더만 늘린다.
      const rounded = Math.round(next * 1000) / 1000
      if (rounded !== last.current) {
        last.current = rounded
        setProgress(rounded)
      }
    }

    const onScroll = () => {
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [])

  return [ref, progress]
}
