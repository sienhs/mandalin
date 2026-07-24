import type { Mandalart } from './types'

const DOMAIN_TITLES = [
  '건강',
  '커리어',
  '학습',
  '관계',
  '핵심 목표',
  '재정',
  '취미',
  '멘탈',
  '환경',
]

const TASK_WORDS = [
  '루틴 만들기',
  '주 3회 실천',
  '기록 남기기',
  '피드백 받기',
  '작게 시작',
  '30일 챌린지',
  '회고 작성',
  '보상 정하기',
]

// 결정적(seed 고정) 진행률 — 매 렌더 동일한 마을이 나오도록.
// 블록마다 성장 정도를 다르게 줘서 마을풍~도시풍 스펙트럼을 한눈에 확인.
function progressFor(domainIdx: number, taskIdx: number): number {
  const base = [10, 35, 55, 75, 95, 60, 40, 25, 80][domainIdx]
  const jitter = ((domainIdx * 7 + taskIdx * 13) % 5) * 8 - 16
  const p = base + jitter
  // 일부는 딱 0(빈땅) / 100(완성)으로 스냅해서 3단계가 다 보이게.
  if (p < 8) return 0
  if (p > 92) return 100
  return Math.round(p)
}

export const MOCK_MANDALART: Mandalart = {
  center: '2026 성장 마을',
  domains: DOMAIN_TITLES.map((title, d) => ({
    id: `d${d}`,
    title,
    tasks: TASK_WORDS.map((w, t) => ({
      id: `d${d}-t${t}`,
      title: w,
      progress: progressFor(d, t),
    })),
  })),
}
