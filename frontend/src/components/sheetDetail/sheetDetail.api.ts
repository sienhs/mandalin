import { fetchSheetDetail } from '../sheet/sheet.api'
import type { SheetDetail as SheetDetailResponse } from '../sheet/sheet.api'
import { DOMAIN_COUNT } from '../sheet/sheet.data'
import type { Domain, Sheet } from '../sheet/sheet.types'
import type { DetailSubject, SheetDetail } from './sheetDetail.types'

/**
 * 상세 조회 응답을 화면이 쓰는 모양으로 옮긴다.
 *
 * 서버는 값이 있는 도메인·과제만 담아 보내고 자리는 position 으로 알린다. 화면은 빈 칸도
 * 그려야 해서 8칸 · 8x8 배열을 미리 만들어 두고 position 자리에 꽂는다 — 그래야 도메인 3개만
 * 채운 시트도 9x9 그리드가 무너지지 않는다.
 */

/** 'YYYY-MM-DDTHH:mm:ss' → 'YYYY-MM-DD'. 서버는 LocalDateTime 인데 화면은 날짜만 쓴다. */
const toDate = (value: string | null): string => value?.slice(0, 10) ?? ''

/** 도메인 8칸 · 과제 8x8 의 빈 자리. sheet.utils 의 것과 달리 과제가 DetailSubject 다. */
const emptySlots = () => ({
  domains: Array.from({ length: DOMAIN_COUNT }, (): Domain | null => null),
  subjects: Array.from({ length: DOMAIN_COUNT }, () =>
    Array.from({ length: DOMAIN_COUNT }, (): DetailSubject | null => null),
  ),
})

export function toSheetDetail(response: SheetDetailResponse): SheetDetail {
  const createdAt = toDate(response.createdAt)

  const sheet: Sheet = {
    userId: response.userId,
    title: response.title,
    isOpen: response.isOpen,
    like: response.likeCount,
    createdAt,
    expiredAt: toDate(response.expiredAt),
  }

  const { domains, subjects } = emptySlots()

  for (const domain of response.domains) {
    // 8칸 밖의 position 은 놓을 자리가 없다. 화면을 깨뜨리느니 버린다.
    if (domain.position < 0 || domain.position >= DOMAIN_COUNT) continue

    domains[domain.position] = {
      sheetId: response.sheetId,
      // 상세 응답에 없는 값들. 화면이 쓰지 않으므로 자리만 채운다.
      domainTemplateId: 0,
      title: domain.title,
      position: domain.position,
      createdAt,
      subjectCount: domain.subjects.filter((subject) => subject.isDone).length,
    }

    for (const subject of domain.subjects) {
      if (subject.position < 0 || subject.position >= DOMAIN_COUNT) continue

      subjects[domain.position][subject.position] = {
        subjectId: subject.subjectId,
        domainId: domain.domainId,
        userId: response.userId,
        title: subject.title,
        period: subject.period,
        point: subject.point,
        // 기간이 'none' 인 과제는 목표·수행 횟수가 null 로 온다. 1회짜리로 본다.
        targetCount: subject.targetCount ?? 1,
        tryCount: subject.tryCount ?? 0,
        position: subject.position,
        isDone: subject.isDone,
        isDonePeriod: subject.isDonePeriod,
        progress: subject.progress,
        // 과제별 시각은 응답에 없다. 화면이 쓰지 않으므로 시트 생성일로 채운다.
        createdAt,
        updatedAt: createdAt,
      }
    }
  }

  return { sheet, domains, subjects, liked: response.isLiked }
}

/** 만다라트 상세를 받아 화면이 쓰는 모양으로 돌려준다. */
export async function fetchSheetDetailView(sheetId: number): Promise<SheetDetail> {
  return toSheetDetail(await fetchSheetDetail(sheetId))
}
