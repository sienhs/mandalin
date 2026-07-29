import { apiFetch } from '../../api'
import { DOMAIN_COUNT } from './sheet.data'
import type { Domain, Period, Sheet, Subject } from './sheet.types'

/**
 * 만다라트 시트 API.
 *
 * 생성 화면(useSheetEditor)은 도메인·과제를 `position 0~7` 로 관리한다. 서버도 같은 값을
 * 그대로 저장하므로 위치 변환은 하지 않는다 — 2D 그리드의 블록 번호(0~8, 4=중앙)로 바꾸는 일은
 * 화면 쪽 관심사라 sheet.utils 의 skipCenter 가 담당한다.
 */

/** GET /api/v1/sheets 응답 1건. */
export type SheetSummary = {
  sheetId: number
  title: string
  isOpen: boolean
  likeCount: number
  achievementRate: number
  createdAt: string
  expiredAt: string | null
}

/** GET /api/v1/sheets/{id} 의 과제 1건. */
export type SubjectDetail = {
  subjectId: number
  position: number
  title: string
  period: Period
  point: number
  targetCount: number | null
  tryCount: number | null
  isDone: boolean
  isDonePeriod: boolean
  /** 0~100. 서버가 확정한 값 — 클라이언트에서 tryCount/targetCount 로 다시 계산하지 않는다. */
  progress: number
}

export type DomainDetail = {
  domainId: number
  /** 0~7. 중앙(핵심 목표)을 뺀 8개 도메인의 순서. */
  position: number
  title: string
  subjects: SubjectDetail[]
}

/** GET /api/v1/sheets/{id} 응답. */
export type SheetDetail = {
  sheetId: number
  userId: number
  title: string
  isOpen: boolean
  likeCount: number
  achievementRate: number
  createdAt: string
  expiredAt: string | null
  domains: DomainDetail[]
}

/** POST /api/v1/sheets 요청 본문 (백엔드 SheetCreateRequest). */
export type SheetCreatePayload = {
  title: string
  isOpen: boolean
  expiredAt: string
  domains: {
    position: number
    title: string
    subjects: {
      position: number
      title: string
      period: Period
      point: number
      targetCount: number
    }[]
  }[]
}

/**
 * 'YYYY-MM-DD' → 'YYYY-MM-DDT00:00:00'.
 *
 * 서버 expiredAt 이 LocalDateTime 이라 날짜만 보내면 Jackson 이 파싱하지 못해 400 이 난다.
 * 편집 화면은 날짜만 다루므로 자정을 붙여 보낸다.
 */
function toLocalDateTime(date: string): string {
  return date.includes('T') ? date : `${date}T00:00:00`
}

/**
 * 편집 중인 상태를 서버 요청 본문으로 옮긴다.
 *
 * 빈 칸이 하나라도 있으면 보내지 않는다 — 서버가 도메인·과제 제목에 @NotBlank 를 걸어두어
 * 빈 값이 섞이면 어차피 400 이고, 그때는 어느 칸이 문제인지 사용자에게 알려줄 수 없다.
 */
export function buildCreatePayload(
  sheet: Sheet,
  domains: (Domain | null)[],
  subjects: (Subject | null)[][],
): SheetCreatePayload {
  const filledDomains = domains.map((domain, d) => {
    if (!domain || !domain.title.trim()) {
      throw new Error(`${d + 1}번째 도메인 이름이 비어 있습니다.`)
    }

    const filledSubjects = (subjects[d] ?? []).map((subject, s) => {
      if (!subject || !subject.title.trim()) {
        throw new Error(`'${domain.title}' 의 ${s + 1}번째 과제가 비어 있습니다.`)
      }
      return {
        position: subject.position,
        title: subject.title,
        period: subject.period,
        point: subject.point,
        targetCount: subject.targetCount,
      }
    })

    if (filledSubjects.length !== DOMAIN_COUNT) {
      throw new Error(`'${domain.title}' 의 과제가 ${DOMAIN_COUNT}개가 아닙니다.`)
    }

    return { position: domain.position, title: domain.title, subjects: filledSubjects }
  })

  if (filledDomains.length !== DOMAIN_COUNT) {
    throw new Error(`도메인이 ${DOMAIN_COUNT}개가 아닙니다.`)
  }

  return {
    title: sheet.title,
    isOpen: sheet.isOpen,
    expiredAt: toLocalDateTime(sheet.expiredAt),
    domains: filledDomains,
  }
}

/** 새 만다라트를 저장한다. 생성된 sheetId 를 돌려준다. */
export function createSheet(payload: SheetCreatePayload): Promise<number> {
  return apiFetch<number>('/api/v1/sheets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 내 만다라트 목록. 서버가 createdAt 내림차순으로 준다(최신이 앞). */
export function fetchMySheets(): Promise<SheetSummary[]> {
  return apiFetch<SheetSummary[]>('/api/v1/sheets')
}

/** 만다라트 상세. 비공개 시트는 소유자만 조회할 수 있다(403). */
export function fetchSheetDetail(sheetId: number): Promise<SheetDetail> {
  return apiFetch<SheetDetail>(`/api/v1/sheets/${sheetId}`)
}
