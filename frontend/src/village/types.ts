/**
 * 만다라트 → 마을 데이터 모델.
 *
 * 만다라트 구조: 중심 목표 아래 9개 도메인, 각 도메인마다 8개 세부 과제.
 * 마을 매핑: 3×3 블록(=9도메인). 각 블록은 3×3 격자이며, 중앙=도메인 표식,
 *            주변 8칸=8개 과제 오브젝트. → 만다라트 3×3 구조를 지형에 그대로 옮김.
 */

export interface Task {
  id: string
  title: string
  /** 0~100. 오브젝트의 3단계 성장(빈땅→기초→완성)을 결정. */
  progress: number
}

export interface Domain {
  id: string
  title: string
  /** 정확히 8개. mandalart 주변 8칸에 대응. */
  tasks: Task[]
}

export interface Mandalart {
  /** 중심 목표(마을 이름/핵심 목표). */
  center: string
  /** 정확히 9개. 3×3 블록 그리드에 배치(index 4 = 중앙 블록). */
  domains: Domain[]
}

/**
 * 진행률 → 표시 단계.
 *  0 = 빈 땅(미착공), 1 = 일관화 shell, 2 = 형태, 3 = 완성.
 */
export function progressStage(progress: number): 0 | 1 | 2 | 3 {
  if (progress <= 0) return 0
  if (progress < 40) return 1
  if (progress < 75) return 2
  return 3
}

/** 블록의 도시화 정도 0~1 (평균 진행률). 마을풍↔도시풍 보간에 사용. */
export function urbanLevelOf(domain: Domain): number {
  if (domain.tasks.length === 0) return 0
  const sum = domain.tasks.reduce((a, t) => a + Math.max(0, Math.min(100, t.progress)), 0)
  return sum / (domain.tasks.length * 100)
}
