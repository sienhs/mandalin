import { DOMAIN_COUNT } from '../sheet/sheet.data'
import type { GroupDetail, GroupMemberContribution } from './group.types'

/**
 * 그룹 만다라트 목업.
 *
 * 두 상태를 모두 만든다 — 방금 만들어 팀장 혼자인 그룹, 그리고 자리가 다 찬 기존 그룹.
 * 화면은 이 두 경우를 데이터만 보고 그려야 한다(초대 버튼 · 안내 문구 노출이 달라진다).
 *
 * 서버 연동 시 loadGroupDetail 을 GET /api/v1/groups/{groupId} 로 바꾸면 된다.
 * 값은 서로 맞아떨어지게 만든다. 멤버 달성률과 그룹 달성률이 같은 완료 수에서 나오지 않으면
 * 화면이 고장 난 것처럼 보인다.
 */

/** 그룹 만다라트의 도메인 자리 수. 8자리 × 과제 8개 = 64칸. */
export const GROUP_DOMAIN_SLOTS = DOMAIN_COUNT

/** 멤버 한 명이 내놓는 도메인 수. 서버도 정확히 2개를 요구한다. */
const DOMAINS_PER_MEMBER = 2

/** 멤버 한 명이 채울 수 있는 과제 칸 수 */
const SUBJECTS_PER_MEMBER = DOMAINS_PER_MEMBER * DOMAIN_COUNT

const rateOf = (done: number, total: number): number => Math.round((done / total) * 100)

/** 멤버 한 명의 목업. doneSubjects = 그 멤버가 완료한 과제 수(최대 16). */
type MemberSeed = { name: string; doneSubjects: number; domains: [string, string] }

/** 자리가 다 찬 기존 그룹. 완료 합계 22 → 그룹 달성률 34%(22/64). */
const EXISTING_MEMBERS: MemberSeed[] = [
  { name: '지우', doneSubjects: 8, domains: ['유산소', '근력운동'] },
  { name: '서연', doneSubjects: 6, domains: ['식단', '수면'] },
  { name: '도현', doneSubjects: 5, domains: ['멘탈케어', '습관'] },
  { name: '하늘', doneSubjects: 3, domains: ['유연성', '컨디션'] },
]

/** 방금 만든 그룹. 팀장 혼자, 도메인 2자리만 채워진 상태. */
const NEW_MEMBERS: MemberSeed[] = [{ name: '지우', doneSubjects: 6, domains: ['유산소', '근력운동'] }]

/** 멤버가 낸 도메인 2개에 완료 과제를 앞에서부터 채운다. */
const buildMember = (seed: MemberSeed, index: number): GroupMemberContribution => ({
  userId: index + 1,
  name: seed.name,
  isCreator: index === 0,
  memberAchievementRate: rateOf(seed.doneSubjects, SUBJECTS_PER_MEMBER),
  domains: seed.domains.map((title, d) => {
    const completedSubjectCount = Math.max(
      0,
      Math.min(DOMAIN_COUNT, seed.doneSubjects - d * DOMAIN_COUNT),
    )
    return {
      domainId: (index + 1) * 100 + d,
      title,
      slotIndex: index * DOMAINS_PER_MEMBER + d + 1,
      completedSubjectCount,
      achievementRate: rateOf(completedSubjectCount, DOMAIN_COUNT),
    }
  }),
})

/**
 * 그룹 상세를 불러온다.
 *
 * justCreated 를 넘기면 방금 만든 그룹(팀장 혼자)을, 넘기지 않으면 기존 그룹(4명)을 준다 —
 * 목업이라 아이디로 구분할 수 없어서 화면이 알려준다. 연동하면 이 갈림길은 사라진다.
 */
export function loadGroupDetail(
  groupId: number,
  overrides?: { title?: string; justCreated?: boolean },
): GroupDetail {
  const seeds = overrides?.justCreated ? NEW_MEMBERS : EXISTING_MEMBERS
  const members = seeds.map(buildMember)
  const doneSubjects = seeds.reduce((sum, seed) => sum + seed.doneSubjects, 0)
  const creatorName = members[0].name

  return {
    groupId,
    title: overrides?.title ?? (overrides?.justCreated ? `${creatorName}님의 만다라트` : '알고리즘 마스터'),
    creatorId: members[0].userId,
    creatorName,
    landmarkBuildingId: null,
    groupAchievementRate: rateOf(doneSubjects, GROUP_DOMAIN_SLOTS * DOMAIN_COUNT),
    mappedDomainCount: members.length * DOMAINS_PER_MEMBER,
    members,
    createdAt: '2026-07-31',
  }
}
