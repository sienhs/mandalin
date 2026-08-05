import { landmarkStageFromPercent, type LandmarkStage } from './partTypes'

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

/**
 * 중앙 블록 랜드마크의 표시 단계 0~8.
 *
 * 중앙 블록의 8개 "과제"는 실제 과제가 아니라 **8개 도메인의 평균 진행률**이다
 * (mandalart.ts 가 그렇게 만든다). 그래서 그 평균 = 만다라트 전체 진행률이다.
 *
 * 진행률을 단계로 바꾸는 규칙 자체는 여기 두지 않는다 — 2D 마을(`IsoVillage`)도 같은 규칙을
 * 써야 하므로 `partTypes.landmarkStageFromPercent` 가 정본이다. 이 함수가 하는 일은
 * "중앙 블록에서 진행률을 꺼내는 것" 뿐이다.
 */
export function landmarkStageOf(center: Domain): LandmarkStage {
  return landmarkStageFromPercent(urbanLevelOf(center) * 100)
}

/** 블록의 도시화 정도 0~1 (평균 진행률). 마을풍↔도시풍 보간에 사용. */
export function urbanLevelOf(domain: Domain): number {
  if (domain.tasks.length === 0) return 0
  const sum = domain.tasks.reduce((a, t) => a + Math.max(0, Math.min(100, t.progress)), 0)
  return sum / (domain.tasks.length * 100)
}
