import type { RewardMilestone } from '../../data/types'
import { num } from '../../utils/format'

/**
 * 구간 문구.
 *
 * <p>트랙·팝오버·공개 모달이 같은 보상을 말하므로 한곳에 둔다. 각자 적으면 보상표를 고칠 때
 * 한쪽만 고쳐진다.
 */

/** 12.5 → '12.5', 25 → '25'. 정수에 굳이 소수점을 달지 않는다. */
export function pct(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/**
 * 아직 안 받은 구간이 무엇을 주는지.
 *
 * <p>랜드마크는 <b>종류를 말할 수 없다</b> — 무작위라 받는 순간 정해지고, 그전까지는 서버도
 * 모른다. 그래서 "랜드마크 1종" 까지가 말할 수 있는 전부다.
 */
export function rewardLong(milestone: RewardMilestone, isFinal: boolean): string {
  if (milestone.kind === 'CREDIT') return `크레딧 ${num(milestone.creditAmount ?? 0)}P`
  return isFinal ? '남은 랜드마크 전종' : '랜드마크 1종 (무작위)'
}
