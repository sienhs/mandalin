import { PERIOD_MAX_COUNT, type Period } from '../../data/types'

export type DraftSubject = {
  title: string
  period: Period
  /** 한 주기에 몇 번 할지. 주기가 바뀌면 그 주기의 상한으로 잘린다. */
  countPerPeriod: number
}
export type DraftDomain = { title: string; subjects: DraftSubject[] }

/** 저장 상한. 코치 제안도 같은 값으로 자른다(`AiCoachPage` 의 `toSuggestion`). */
export const MAX_SHEET_TITLE = 30
export const MAX_DOMAIN_TITLE = 20
export const MAX_SUBJECT_TITLE = 40

export type SheetDraft = {
  title: string
  expiredAt: string
  isOpen: boolean
  domains: DraftDomain[]
}

/** 저장된 초안 + 언제 저장됐는지. 복구 안내에 "몇 칸까지 썼는지"를 같이 보여주려고 센 값도 담는다. */
export type StoredDraft = SheetDraft & { savedAt: string; filled: number }

/**
 * 만다라트 작성 중 초안 보관소.
 *
 * <p><b>왜 필요한가.</b> 81칸이 전부 `SheetCreate` 의 지역 상태라, 좌측 메뉴를 한 번
 * 누르면 화면이 언마운트되면서 30분 작성분이 그대로 사라졌다. 이탈 확인 팝업만 붙이면
 * "정말 나갈까요?" 를 잘못 눌렀을 때 여전히 다 날아가므로, 애초에 <b>나가도 남아 있게</b>
 * 만든다. 팝업은 그다음 안전장치다.
 *
 * <p><b>sessionStorage 를 쓴다.</b> 초안은 이 탭에서 하던 작업이다. localStorage 에 두면
 * 몇 주 전에 접어 둔 초안이 새 만다라트를 만들려는 사람에게 다시 튀어나오고, 여러 탭이
 * 같은 열쇠를 덮어쓴다. 새로고침·탭 이동·뒤로가기는 sessionStorage 로 모두 살아남는다.
 */
const KEY = 'mandarin:sheet-draft:new'

/** 저장 포맷이 바뀌면 올린다. 다른 값이면 읽지 않고 버린다 — 반쯤 맞는 초안이 더 나쁘다. */
const VERSION = 2

const EMPTY_SUBJECT: DraftSubject = { title: '', period: 'DAILY', countPerPeriod: 1 }

/** 8×8 빈 초안. `SheetCreate` 와 복구 경로가 같은 뼈대를 써야 칸 수가 어긋나지 않는다. */
export function emptyDomains(): DraftDomain[] {
  return Array.from({ length: 8 }, () => ({
    title: '',
    subjects: Array.from({ length: 8 }, () => ({ ...EMPTY_SUBJECT })),
  }))
}

/** 채운 칸 수(핵심 목표 1 + 세부 목표 8 + 과제 64 = 81). */
export function countFilled(draft: Pick<SheetDraft, 'title' | 'domains'>): number {
  return (
    (draft.title.trim() ? 1 : 0) +
    draft.domains.reduce(
      (acc, d) =>
        acc + (d.title.trim() ? 1 : 0) + d.subjects.filter((s) => s.title.trim()).length,
      0,
    )
  )
}

const isPeriod = (value: unknown): value is Period =>
  typeof value === 'string' && value in PERIOD_MAX_COUNT

/**
 * 저장된 값을 8×8 모양으로 되돌린다.
 *
 * <p>손으로 고친 sessionStorage, 예전 버전이 남긴 값, 저장 중 잘린 JSON 이 모두 여기로
 * 들어온다. 칸 수가 모자라거나 주기 이름이 낯설면 <b>그 칸만</b> 기본값으로 메우고 나머지는
 * 살린다 — 한 칸 때문에 초안 전체를 버릴 이유는 없다.
 */
function normalize(raw: unknown): SheetDraft | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>

  const domainsRaw = Array.isArray(value.domains) ? value.domains : []

  const domains = emptyDomains().map((slot, i) => {
    const from = domainsRaw[i]
    if (!from || typeof from !== 'object') return slot
    const d = from as Record<string, unknown>
    const subjectsRaw = Array.isArray(d.subjects) ? d.subjects : []

    return {
      title: typeof d.title === 'string' ? d.title.slice(0, MAX_DOMAIN_TITLE) : '',
      subjects: slot.subjects.map((subSlot, j) => {
        const s = subjectsRaw[j]
        if (!s || typeof s !== 'object') return subSlot
        const sub = s as Record<string, unknown>
        const period = isPeriod(sub.period) ? sub.period : 'DAILY'
        const count = typeof sub.countPerPeriod === 'number' ? sub.countPerPeriod : 1
        return {
          title: typeof sub.title === 'string' ? sub.title.slice(0, MAX_SUBJECT_TITLE) : '',
          period,
          // 주기 상한을 넘는 횟수는 저장 단계에서 서버에 거절당한다. 읽을 때 잘라 둔다.
          countPerPeriod: Math.min(Math.max(1, Math.round(count)), PERIOD_MAX_COUNT[period]),
        }
      }),
    }
  })

  return {
    title: typeof value.title === 'string' ? value.title.slice(0, MAX_SHEET_TITLE) : '',
    expiredAt: typeof value.expiredAt === 'string' ? value.expiredAt : '',
    isOpen: typeof value.isOpen === 'boolean' ? value.isOpen : true,
    domains,
  }
}

/**
 * 보관된 초안을 읽는다. 한 칸도 채우지 않은 초안은 없는 것으로 본다 —
 * 들어왔다 바로 나간 사람에게 "이어서 작성할까요?" 를 물으면 성가시기만 하다.
 */
export function loadDraft(): StoredDraft | null {
  try {
    const text = sessionStorage.getItem(KEY)
    if (!text) return null

    const parsed = JSON.parse(text) as Record<string, unknown>
    if (parsed?.v !== VERSION) {
      sessionStorage.removeItem(KEY)
      return null
    }

    const draft = normalize(parsed.draft)
    if (!draft) return null

    const filled = countFilled(draft)
    if (filled === 0) return null

    return {
      ...draft,
      filled,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : '',
    }
  } catch {
    // 손상된 값이 남아 다음 진입까지 계속 실패하지 않게 지운다.
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* 스토리지 자체가 막힌 환경이면 애초에 저장도 안 됐다 */
    }
    return null
  }
}

/** 초안을 덮어쓴다. 빈 초안이면 저장하지 않고 지운다. */
export function saveDraft(draft: SheetDraft): void {
  try {
    if (countFilled(draft) === 0) {
      sessionStorage.removeItem(KEY)
      return
    }
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ v: VERSION, savedAt: new Date().toISOString(), draft }),
    )
  } catch {
    /*
      사파리 프라이빗 모드·용량 초과에서 던진다. 저장이 안 되더라도 작성 자체는 막지 않는다 —
      이 화면의 진짜 상태는 React 쪽에 있고 이건 보조 사본이다.
    */
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* 위와 같은 이유로 무시한다 */
  }
}
