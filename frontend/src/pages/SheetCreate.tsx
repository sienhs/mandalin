import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { PERIOD_MAX_COUNT, type Period, type Sheet } from '../data/types'
import MandalartGrid, { type CellRef } from '../features/sheet/MandalartGrid'
import {
  clearDraft,
  emptyDomains,
  loadDraft,
  saveDraft,
  type DraftDomain,
  type DraftSubject,
  type StoredDraft,
} from '../features/sheet/draftStorage'
import Button from '../components/common/ActionButton'
import Modal from '../components/common/Modal'
import { useUnsavedWarning } from '../components/common/UnsavedGuard'
import { useToast } from '../components/common/Toast'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconSparkle,
} from '../components/common/Icons'
import { Field, Input, Segmented, domainColor } from '../components/common/Primitives'
import { cn } from '../utils/cn'
import { fromNow } from '../utils/format'

const TODAY = new Date().toISOString().slice(0, 10)
const IN_SIX_MONTHS = new Date(Date.now() + 1000 * 60 * 60 * 24 * 182).toISOString().slice(0, 10)

/** AI 코치에서 넘어올 때 실려 오는 초안. */
type CoachDraft = {
  title?: string
  domains?: Array<{
    title: string
    /**
     * `countPerPeriod` 는 코치가 주기와 함께 정한 값이다("주 3회" 의 3).
     *
     * <p>옛 초안(횟수가 없던 시절)이 뒤로가기 히스토리에 남아 있을 수 있어 옵셔널이다 —
     * 없으면 1 로 본다.
     */
    subjects: Array<{ title: string; period: Period; countPerPeriod?: number }>
  }>
}

/**
 * 코치가 정한 주기당 횟수를 그 주기에서 가능한 값으로 맞춘다.
 *
 * <p>일간·없음은 1 회 고정이고 주간은 1~7, 월간은 1~30 이다(`PERIOD_MAX_COUNT`).
 * 서버도 코치도 같은 규칙으로 자르지만, 이 값은 <b>브라우저 히스토리를 거쳐</b> 오므로
 * (뒤로가기로 되살아난 옛 state) 받는 쪽에서 한 번 더 본다.
 */
const seededCount = (period: Period, count?: number): number =>
  Math.min(Math.max(1, Math.round(count ?? 1)), PERIOD_MAX_COUNT[period])

/**
 * 코치 초안을 8×8 뼈대에 얹는다.
 *
 * <p>코치는 8칸을 다 채우지 못할 수도 있어서(대화가 짧게 끝나면) 빈 칸은 그대로 남긴다.
 */
function fromCoach(seeded: CoachDraft): DraftDomain[] {
  return emptyDomains().map((empty, i) => {
    const from = seeded.domains?.[i]
    if (!from) return empty
    return {
      title: from.title ?? '',
      subjects: empty.subjects.map((slot, j) => {
        const s = from.subjects?.[j]
        return s
          ? {
              ...slot,
              title: s.title,
              period: s.period,
              countPerPeriod: seededCount(s.period, s.countPerPeriod),
            }
          : slot
      }),
    }
  })
}

/**
 * 쓰던 초안 위에 코치 초안을 겹쳐 놓는다. <b>이미 쓴 칸은 절대 덮지 않는다.</b>
 *
 * <p>편집기에서 코치로 갔다 돌아오는 길을 열면 이 상황이 생긴다 — 30칸을 직접 쓴 사람이
 * 남은 칸을 코치에게 받으려고 다녀온 것이다. 코치 제안으로 통째로 교체하면 그 30칸이 사라진다.
 *
 * <p>배치 규칙: 같은 이름의 세부 목표가 있으면 그 블록에 과제를 보태고, 없으면 빈 블록을
 * 찾아 넣는다. 8블록 · 블록당 8과제가 이미 찼으면 남는 제안은 버린다(서버 규칙이 8×8 이다).
 */
function mergeCoach(base: DraftDomain[], seeded: CoachDraft): { domains: DraftDomain[]; added: number } {
  const next = base.map((d) => ({ ...d, subjects: d.subjects.map((s) => ({ ...s })) }))
  let added = 0

  for (const from of seeded.domains ?? []) {
    const domainTitle = (from.title ?? '').trim()
    if (!domainTitle) continue

    let slot = next.findIndex((d) => d.title.trim() === domainTitle)
    if (slot < 0) {
      slot = next.findIndex((d) => !d.title.trim())
      if (slot < 0) continue
      next[slot].title = domainTitle
      added += 1
    }

    for (const s of from.subjects ?? []) {
      const subjectTitle = (s.title ?? '').trim()
      if (!subjectTitle) continue
      // 같은 과제를 두 번 담지 않는다 — 코치를 두 번 다녀오면 그대로 겹친다.
      if (next[slot].subjects.some((x) => x.title.trim() === subjectTitle)) continue

      const free = next[slot].subjects.findIndex((x) => !x.title.trim())
      if (free < 0) break
      next[slot].subjects[free] = {
        title: subjectTitle,
        period: s.period,
        countPerPeriod: seededCount(s.period, s.countPerPeriod),
      }
      added += 1
    }
  }

  return { domains: next, added }
}

/**
 * 과제 한 줄 입력.
 *
 * <p>도메인 편집(8줄을 한 번에)과 칸 하나 편집이 같은 모양을 써야 한다 — 둘이 다르면
 * 어느 쪽으로 들어왔는지에 따라 입력 규칙이 달라 보인다.
 */
/**
 * '선택한 칸' 패널의 공통 껍데기 — 머리말 + 본문.
 *
 * <p>세 모드가 각자 머리말을 그리면 칸을 옮길 때마다 배지 위치와 여백이 달라 패널이
 * 들썩인다. 뼈대를 하나로 두면 바뀌는 건 글자뿐이라 시선이 고정된다.
 */
function PanelShell({
  title,
  caption,
  chip,
  done,
  children,
}: {
  title: string
  caption: string
  chip?: { label: string; color: string }
  done?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div
        className="flex items-center gap-2.5 border-b pb-4"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        {chip && (
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-[12px] font-black text-white"
            style={{ background: chip.color }}
          >
            {chip.label}
          </span>
        )}

        {/* min-w-0 이 없으면 긴 제목이 배지를 밀어내고 오른쪽 표시를 화면 밖으로 보낸다. */}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-extrabold leading-tight">{title}</span>
          <span className="muted mt-0.5 block text-[11.5px] font-bold">{caption}</span>
        </span>

        {done && (
          <span
            aria-label="채움"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
          >
            <IconCheck className="size-3.5" />
          </span>
        )}
      </div>

      {children}
    </div>
  )
}

/** 이웃 칸으로 넘어가는 아래쪽 이동 줄. 갈 곳이 없으면 버튼을 흐리게 두되 자리는 지킨다. */
function PanelNav({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  prevLabel: string
  nextLabel: string
  onPrev?: () => void
  onNext?: () => void
}) {
  return (
    <div
      className="mt-auto flex gap-2 border-t pt-4"
      style={{ borderColor: 'var(--border-hairline)' }}
    >
      <Button variant="quiet" size="sm" className="flex-1" disabled={!onPrev} onClick={onPrev}>
        <IconArrowLeft className="size-4" /> {prevLabel}
      </Button>
      <Button variant="quiet" size="sm" className="flex-1" disabled={!onNext} onClick={onNext}>
        {nextLabel} <IconArrowRight className="size-4" />
      </Button>
    </div>
  )
}

/** 주기 토글에 쓰는 짧은 이름. `PERIOD_LABEL`("주 단위"·"기간 내")은 좁은 칸에 안 들어간다. */
const PERIOD_SHORT: Record<Period, string> = {
  DAILY: '매일',
  WEEKLY: '주',
  MONTHLY: '월',
  NONE: '한번',
}

const PERIOD_HINT: Record<Period, string> = {
  DAILY: '하루에 한 번 (횟수 고정)',
  WEEKLY: '주마다 최대 7회',
  MONTHLY: '달마다 최대 30회',
  NONE: '기간 안에 딱 한 번 (자격증 취득 등)',
}

const PERIOD_ORDER: Period[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'NONE']

/**
 * 주기당 수행 횟수 조절기.
 *
 * <p>매일·한번은 상한이 1이라 조절할 것이 없다. 그때 <b>버튼을 숨기지 않고 흐리게 두는</b>
 * 이유는, 사라지면 줄 폭이 흔들려 8줄이 주기를 바꿀 때마다 들썩이기 때문이다.
 * 남겨 두면 "여기는 고를 수 없는 자리"라는 것도 함께 읽힌다.
 */
function CountStepper({
  period,
  value,
  disabled,
  onChange,
}: {
  period: Period
  value: number
  disabled?: boolean
  onChange: (next: number) => void
}) {
  const max = PERIOD_MAX_COUNT[period]
  const fixed = disabled || max <= 1

  const step = (delta: number) => {
    if (fixed) return
    onChange(Math.min(max, Math.max(1, value + delta)))
  }

  return (
    <div
      className={cn('flex shrink-0 items-center rounded-xl border', fixed && 'opacity-45')}
      style={{ borderColor: 'var(--border-hairline)' }}
      title={fixed ? '이 주기는 횟수를 바꿀 수 없어요' : `1 ~ ${max}회`}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={fixed || value <= 1}
        aria-label="횟수 줄이기"
        className="grid h-9 w-7 place-items-center rounded-l-xl text-[15px] font-black text-[var(--text-muted)] transition-colors disabled:opacity-40 enabled:hover:text-[var(--text-strong)]"
      >
        −
      </button>

      <span className="min-w-[34px] text-center text-[12px] font-black tabular-nums">
        {value}회
      </span>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={fixed || value >= max}
        aria-label="횟수 늘리기"
        className="grid h-9 w-7 place-items-center rounded-r-xl text-[15px] font-black text-[var(--text-muted)] transition-colors disabled:opacity-40 enabled:hover:text-[var(--text-strong)]"
      >
        +
      </button>
    </div>
  )
}

/**
 * 과제 한 줄 — 번호 · 제목 / 주기 · 횟수.
 *
 * <p><b>두 줄로 나눈 이유.</b> 한 줄에 다 넣으려니 패널 폭(약 370px)에서 입력창이
 * 200px 아래로 눌렸다. 제목이 이 화면의 주인공인데 가장 좁아지는 셈이라, 제목에 한 줄을
 * 통째로 주고 주기·횟수를 아래로 내렸다.
 *
 * <p><b>네이티브 select 를 쓰지 않는다.</b> 이전에는 `<Select>` 였는데 공통 스타일
 * (`CONTROL`)의 `w-full` 때문에 폭 지정이 먹지 않아 카드 밖으로 넘쳐 잘렸다.
 * 버튼은 폭이 내용에서 나오므로 그런 일이 없다.
 */
function SubjectRow({
  index,
  value,
  color,
  autoFocus,
  disabled,
  inputRef,
  onChange,
}: {
  index: number
  value: DraftSubject
  color: string
  autoFocus?: boolean
  disabled?: boolean
  inputRef?: Ref<HTMLInputElement>
  onChange: (patch: Partial<DraftSubject>) => void
}) {
  const filled = value.title.trim().length > 0

  /*
    주기를 바꾸면 횟수를 그 주기의 범위로 되돌린다.
    월 20회에서 주로 옮기면 20은 허용 밖(최대 7)이라 그대로 두면 저장이 어긋난다.
  */
  const changePeriod = (period: Period) => {
    const max = PERIOD_MAX_COUNT[period]
    onChange({ period, countPerPeriod: Math.min(value.countPerPeriod, max) })
  }

  return (
    <div
      className="rounded-xl p-2"
      style={{ background: filled ? 'transparent' : 'var(--surface-sunken)' }}
    >
      <div className="flex items-center gap-2">
        {/* 번호 배지 — 몇 번째 칸을 채우는지 그리드와 대조하기 위한 것 */}
        <span
          aria-hidden="true"
          className="grid size-6 shrink-0 place-items-center rounded-md text-[10.5px] font-black"
          style={{
            background: filled ? color : 'var(--surface-card)',
            color: filled ? '#fff' : 'var(--text-muted)',
          }}
        >
          {index + 1}
        </span>

        <input
          ref={inputRef}
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`과제 ${index + 1}`}
          maxLength={40}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-label={`과제 ${index + 1} 제목`}
          className="h-10 min-w-0 flex-1 rounded-xl border bg-[var(--surface-card)] px-3 text-[13px] font-semibold text-[var(--text-strong)] outline-none transition-colors placeholder:font-medium placeholder:text-[var(--text-muted)] focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: 'var(--border-hairline)' }}
        />
      </div>

      <div className="mt-1.5 flex items-center gap-2 pl-8">
        <div
          role="group"
          aria-label={`과제 ${index + 1} 반복 주기`}
          className="flex min-w-0 flex-1 items-center gap-0.5 rounded-xl p-0.5"
          style={{ background: 'var(--surface-card)' }}
        >
          {PERIOD_ORDER.map((p) => {
            const active = value.period === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => changePeriod(p)}
                disabled={disabled}
                aria-pressed={active}
                title={PERIOD_HINT[p]}
                className={cn(
                  'h-8 min-w-0 flex-1 rounded-[10px] px-1 text-[11.5px] font-bold transition-colors',
                  active
                    ? 'bg-[var(--surface-sunken)] text-[var(--text-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
                )}
                style={active ? { boxShadow: `inset 0 0 0 1.5px ${color}` } : undefined}
              >
                {PERIOD_SHORT[p]}
              </button>
            )
          })}
        </div>

        <CountStepper
          period={value.period}
          value={value.countPerPeriod}
          disabled={disabled}
          onChange={(next) => onChange({ countPerPeriod: next })}
        />
      </div>
    </div>
  )
}

export default function SheetCreate() {
  const { createSheet } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  /**
   * 코치가 만들어 준 초안으로 시작한다.
   *
   * 코치는 8×8 을 다 채우지 못할 수도 있어서(대화가 짧게 끝나면) 여기서 이어 채운다.
   * 저장 조건은 어느 경로로 들어왔든 똑같이 81칸이다.
   */
  const seeded = location.state as CoachDraft | null

  /** 이 탭에서 쓰다 나간 초안. 마운트할 때 한 번만 읽는다. */
  const [restored] = useState<StoredDraft | null>(() => loadDraft())

  /**
   * 쓰던 초안과 코치 초안이 둘 다 있는 상태 — 편집기에서 코치를 다녀온 경로다.
   * 어느 쪽을 살릴지는 사람만 알 수 있으므로 묻는다.
   */
  const [mergeAsk, setMergeAsk] = useState(Boolean(seeded && restored))

  /** 되살렸다는 사실을 알리는 줄. 닫으면 이번 작성 동안 다시 뜨지 않는다. */
  const [restoreNotice, setRestoreNotice] = useState(Boolean(restored) && !seeded)

  const [pickerOpen, setPickerOpen] = useState(!seeded && !restored)
  const [confirmOpen, setConfirmOpen] = useState(false)
  /** 되살린 초안을 버릴지 묻는 팝업. */
  const [resetOpen, setResetOpen] = useState(false)
  /** 취소로 작성을 그만둘지 묻는 팝업. */
  const [cancelOpen, setCancelOpen] = useState(false)
  /*
    쓰던 초안이 있으면 그것으로 시작한다 — 코치 제안은 아직 얹지 않는다. 무엇을 살릴지
    답을 받기 전에 화면을 바꿔 버리면, 팝업을 닫기만 해도 이미 덮여 있게 된다.
  */
  const [title, setTitle] = useState(restored?.title ?? seeded?.title ?? '')
  const [expiredAt, setExpiredAt] = useState(restored?.expiredAt || IN_SIX_MONTHS)
  const [isOpen, setIsOpen] = useState(restored?.isOpen ?? true)

  const [domains, setDomains] = useState<DraftDomain[]>(
    () => restored?.domains ?? (seeded ? fromCoach(seeded) : emptyDomains()),
  )
  const [selected, setSelected] = useState<CellRef | null>(
    seeded || restored ? { kind: 'domain', domainIndex: 0 } : { kind: 'core' },
  )
  const [saving, setSaving] = useState(false)

  /** 도메인을 넘길 때 과제 목록을 1번으로 되돌리고, 격자에서 누른 과제 입력에 초점을 준다. */
  const subjectListRef = useRef<HTMLDivElement>(null)
  /**
   * 핵심 목표 없이 다른 칸을 누른 적이 있는가. 빨간 테두리와 안내를 띄운다.
   *
   * <p>제목을 채우면 저절로 사라진다(그릴 때 `!title.trim()` 을 함께 본다) — 상태를 따로
   * 꺼 주지 않아도 되고, 지웠다가 다시 비면 경고가 되살아나는 것이 맞다.
   */
  const [coreRejected, setCoreRejected] = useState(false)
  /** 흔들림 한 번. 애니메이션이 끝나면 스스로 꺼져 다음 거절에 다시 켤 수 있다. */
  const [coreShaking, setCoreShaking] = useState(false)

  /**
   * 세부 목표 없이 과제 칸을 눌러 거절당한 <b>세부 목표 번호</b>. 없으면 null.
   *
   * <p>참/거짓이 아닌 번호인 이유: 세부 목표는 8개다. 불리언으로 두면 3번에서 거절당한 뒤
   * 5번으로 옮겼을 때, 5번은 아무 잘못이 없는데도 빨간 테두리를 그대로 이고 있게 된다.
   */
  const [domainRejected, setDomainRejected] = useState<number | null>(null)
  const [domainShaking, setDomainShaking] = useState(false)

  const subjectInputRef = useRef<HTMLInputElement>(null)
  const domainInputRef = useRef<HTMLInputElement>(null)
  const coreInputRef = useRef<HTMLInputElement>(null)
  const selectedDomainIndex = selected?.kind === 'domain' ? selected.domainIndex : null

  useEffect(() => {
    if (selectedDomainIndex == null) return
    subjectListRef.current?.scrollTo({ top: 0 })
  }, [selectedDomainIndex])

  /** 격자에서 이미 작성된 칸을 눌렀을 때 기존 문장 맨 뒤에서 이어 쓰게 한다. */
  const focusAtEnd = (input: HTMLInputElement | null) => {
    if (!input) return
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  /**
   * 핵심 목표가 비어 거절당했다는 신호.
   *
   * <p>예전에는 다른 칸을 눌러도 <b>말없이</b> 가운데 칸으로 되돌려 보내기만 했다. 누른 칸이
   * 열리지 않으니 클릭이 먹지 않은 것처럼 보였고, 왜 안 되는지도 화면 어디에도 없었다.
   *
   * <p>흔들림을 두 단계로 켜는 이유: 같은 클래스를 계속 달아 두면 두 번째 클릭에서 애니메이션이
   * <b>다시 시작하지 않는다</b>(이미 끝난 애니메이션이라 브라우저가 무시한다). 한 프레임 껐다
   * 켜야 다시 돈다. 요소를 remount 시키는 방법도 있지만 그러면 입력이 초점을 잃는다.
   */
  const nudgeCore = () => {
    setCoreRejected(true)
    setCoreShaking(false)
    window.requestAnimationFrame(() => setCoreShaking(true))
  }

  /** 세부 목표가 비어 과제를 열지 못했다는 신호. `nudgeCore` 와 같은 규칙이다. */
  const nudgeDomain = (domainIndex: number) => {
    setDomainRejected(domainIndex)
    setDomainShaking(false)
    window.requestAnimationFrame(() => setDomainShaking(true))
  }

  const selectCell = (cell: CellRef) => {
    if (cell.kind === 'core') {
      setSelected(cell)
      window.requestAnimationFrame(() => focusAtEnd(coreInputRef.current))
      return
    }

    // 핵심 목표가 없으면 나머지 80칸보다 먼저 가운데 칸을 작성하게 안내한다.
    if (!title.trim()) {
      setSelected({ kind: 'core' })
      nudgeCore()
      window.requestAnimationFrame(() => focusAtEnd(coreInputRef.current))
      return
    }

    if (cell.kind === 'domain') {
      setSelected(cell)
      window.requestAnimationFrame(() => focusAtEnd(domainInputRef.current))
      return
    }

    // 과제의 부모인 세부 목표가 비어 있으면 그 입력으로 먼저 보낸다.
    if (!domains[cell.domainIndex]?.title.trim()) {
      setSelected({ kind: 'domain', domainIndex: cell.domainIndex })
      nudgeDomain(cell.domainIndex)
      window.requestAnimationFrame(() => focusAtEnd(domainInputRef.current))
      return
    }

    setSelected(cell)
    // 같은 칸을 다시 눌러도 상태값은 바뀌지 않으므로 클릭 시점에 직접 포커스한다.
    window.requestAnimationFrame(() => focusAtEnd(subjectInputRef.current))
  }

  const isCellLocked = (cell: CellRef) => {
    if (cell.kind === 'core') return false
    if (!title.trim()) return true
    if (cell.kind === 'domain') return false
    return !domains[cell.domainIndex]?.title.trim()
  }

  /**
   * 이 작성을 끝냈는지(저장 성공 또는 사용자가 그만두기를 확정).
   *
   * <p>끝난 뒤에는 자동저장을 멈춘다 — 끝낼 때 보관한 초안을 지우는데, 자동저장이 한 번 더
   * 돌면 지운 것이 되살아나 다음번에 "이어서 작성할까요?" 가 엉뚱하게 뜬다.
   */
  const finishedRef = useRef(false)

  const preview: Sheet = useMemo(
    () => ({
      id: 0,
      title,
      isOpen,
      likeCount: 0,
      isLiked: false,
      achievementRate: 0,
      createdAt: TODAY,
      expiredAt,
      terrain: 'GRASS_PATH',
      domains: domains.map((d, i) => ({
        id: i,
        position: i,
        title: d.title,
        subjects: d.subjects
          .map((s, j) => ({ s, j }))
          .filter(({ s }) => s.title.trim())
          .map(({ s, j }) => ({
            id: i * 10 + j,
            position: j,
            title: s.title,
            period: s.period,
            point: 100,
            targetCount: 1,
            tryCount: 0,
            isDone: false,
            isDonePeriod: false,
            countPerPeriod: s.countPerPeriod,
            currentPeriodCount: 0,
            isDoneToday: false,
            // 아직 저장하지 않은 미리보기라 수행 자체가 없다.
            canExecute: false,
            progress: 0,
          })),
      })),
    }),
    [title, expiredAt, isOpen, domains],
  )

  /**
   * 완성도.
   *
   * 만다라트는 저장하면 고칠 수 없어서 81칸을 다 채워야 저장된다(서버도 8×8 을 강제한다).
   * 그래서 "지금 몇 칸 남았는지"를 계속 보여준다 — 저장 버튼을 눌러서야 알게 하면 늦다.
   */
  const status = useMemo(() => {
    const domainDone = domains.filter((d) => d.title.trim()).length
    const subjectDone = domains.reduce(
      (acc, d) => acc + d.subjects.filter((s) => s.title.trim()).length,
      0,
    )
    const filled = (title.trim() ? 1 : 0) + domainDone * 2 + subjectDone

    /** 아직 덜 찬 블록. 어디를 채워야 하는지 바로 짚어준다. */
    const incomplete = domains
      .map((d, i) => ({
        index: i,
        title: d.title.trim(),
        missingTitle: !d.title.trim(),
        missingSubjects: 8 - d.subjects.filter((s) => s.title.trim()).length,
      }))
      .filter((d) => d.missingTitle || d.missingSubjects > 0)

    return {
      filled,
      domainDone,
      subjectDone,
      incomplete,
      complete: filled === 81,
    }
  }, [title, domains])

  /**
   * 작성 중인 내용이 있으면 화면을 떠나기 전에 묻는다.
   *
   * <p>"사라진다" 고 하지 않는다 — 초안은 자동으로 보관되므로 실제로는 남아 있고 돌아오면
   * 이어 쓸 수 있다. 사실과 다른 경고는 두 번째부터 아무도 안 읽는다.
   */
  const warning = useMemo(
    () =>
      status.filled === 0
        ? null
        : {
            title: '작성 중인 만다라트가 있어요',
            description: `${status.filled}칸을 채웠습니다. 지금 나가면 여기까지 임시 보관되고, 새 만다라트 화면으로 돌아올 때 이어서 쓸 수 있어요.`,
            leaveLabel: '나가기',
            stayLabel: '계속 작성하기',
          },
    [status.filled],
  )
  useUnsavedWarning(warning)

  /**
   * 자동 임시저장.
   *
   * <p>글자 하나마다 직렬화하면 81칸을 채우는 사이 수백 번 쓴다. 400ms 멈추면 그때 한 번만
   * 쓴다 — 칸을 옮기거나 다음 문구를 생각하는 틈이면 충분히 저장된다.
   */
  useEffect(() => {
    if (finishedRef.current) return
    const timer = window.setTimeout(() => saveDraft({ title, expiredAt, isOpen, domains }), 400)
    return () => window.clearTimeout(timer)
  }, [title, expiredAt, isOpen, domains])

  const save = async () => {
    if (!status.complete) return

    setSaving(true)
    const id = await createSheet({
      title: title.trim(),
      isOpen,
      expiredAt,
      domains: domains.map((d, position) => ({
        position,
        title: d.title.trim(),
        subjects: d.subjects.map((s, i) => ({
          position: i,
          title: s.title.trim(),
          period: s.period,
          countPerPeriod: s.countPerPeriod,
        })),
      })),
    })
    setSaving(false)
    setConfirmOpen(false)

    /*
      실패했으면(id == null) 초안을 지우지 않는다 — 서버가 거절했을 때 81칸이 함께
      사라지면 처음부터 다시 써야 한다. 성공했을 때만 보관을 끝낸다.
    */
    if (id != null) {
      finishedRef.current = true
      clearDraft()
      navigate(`/app/sheets/${id}`, { replace: true })
    }
  }

  /**
   * 되살린 초안을 버리고 빈 화면에서 다시 시작한다.
   *
   * <p>81칸을 한 번에 지우는 동작이라 곧바로 실행하지 않고 한 번 묻는다(`resetOpen`).
   */
  const resetDraft = () => {
    setTitle('')
    setExpiredAt(IN_SIX_MONTHS)
    setIsOpen(true)
    setDomains(emptyDomains())
    setSelected({ kind: 'core' })
    clearDraft()
    setRestoreNotice(false)
    setResetOpen(false)
    setPickerOpen(true)
  }

  /**
   * 코치에게 다녀온다.
   *
   * <p>자동저장은 400ms 쉰 뒤에 쓰므로 방금 친 글자가 아직 안 담겼을 수 있다. 여기서 한 번
   * 확실히 써 두면 코치에서 돌아왔을 때 그대로 이어진다.
   */
  const goToCoach = () => {
    saveDraft({ title, expiredAt, isOpen, domains })
    navigate('/app/coach')
  }

  /**
   * 코치 초안을 다 쓴 뒤 라우터 state 를 비운다.
   *
   * <p>비우지 않으면 이 history 항목에 코치 초안이 남아, 새로고침할 때마다 "어떻게 넣을까요?"
   * 가 다시 뜬다.
   */
  const dropSeeded = () => navigate('/app/sheets/new', { replace: true, state: null })

  /** 코치 제안을 빈 칸에만 채운다. 쓰던 칸은 그대로 남는다. */
  const applyCoachMerge = () => {
    if (!seeded) return
    const { domains: merged, added } = mergeCoach(domains, seeded)
    setDomains(merged)
    if (!title.trim() && seeded.title) setTitle(seeded.title)
    setMergeAsk(false)
    dropSeeded()
    toast.show({
      tone: added > 0 ? 'success' : 'info',
      title:
        added > 0
          ? `코치 제안 ${added}칸을 빈 칸에 채웠어요`
          : '빈 칸에 넣을 새 제안이 없었어요',
      body: added > 0 ? undefined : '이미 8×8 이 찼거나 같은 과제였어요.',
    })
  }

  /** 쓰던 초안을 버리고 코치 초안만으로 다시 시작한다. */
  const replaceWithCoach = () => {
    if (!seeded) return
    setTitle(seeded.title ?? '')
    setDomains(fromCoach(seeded))
    setSelected({ kind: 'domain', domainIndex: 0 })
    setMergeAsk(false)
    dropSeeded()
  }

  /**
   * 작성을 그만두고 목록으로. 보관한 초안까지 지운다.
   *
   * <p>사이드바로 나가는 것과 다르게 다룬다 — 저쪽은 "잠깐 다른 걸 보러 가는" 이동이라
   * 초안을 남겨야 하고, 이 버튼은 "이 만다라트를 안 만들겠다" 는 뜻이라 남기면 다음 진입마다
   * 지운 줄 알았던 초안이 되살아난다.
   */
  const discardAndLeave = () => {
    finishedRef.current = true
    clearDraft()
    setCancelOpen(false)
    navigate('/app/sheets')
  }

  /** 과제 한 칸 수정. 도메인 편집과 단일 칸 편집이 함께 쓴다. */
  const patchSubject = (domainIndex: number, subjectIndex: number, patch: Partial<DraftSubject>) =>
    setDomains((prev) =>
      prev.map((d, i) =>
        i === domainIndex
          ? {
              ...d,
              subjects: d.subjects.map((sub, k) =>
                k === subjectIndex ? { ...sub, ...patch } : sub,
              ),
            }
          : d,
      ),
    )

  /**
   * 오른쪽 '선택한 칸' 패널.
   *
   * <p>세 가지 모드(가운데·세부 목표·과제 한 칸)가 각자 다른 머리말과 여백을 쓰고 있어서,
   * 칸을 옮길 때마다 패널이 들썩이고 어디가 제목인지 매번 다시 찾아야 했다.
   * <b>머리말 → 본문 → 이동</b> 세 층으로 통일한다 — 모드가 바뀌어도 뼈대는 그대로다.
   */
  const editor = (() => {
    if (!selected) {
      return (
        <PanelShell title="선택한 칸" caption="왼쪽 격자에서 채울 칸을 눌러 주세요.">
          <p className="muted m-0 text-[12.5px] font-medium leading-relaxed">
            가운데 칸에 핵심 목표를 적고, 둘레 8칸에 세부 목표를, 그 바깥에 실천 과제 64개를
            채웁니다.
          </p>
        </PanelShell>
      )
    }

    if (selected.kind === 'core') {
      /*
        배지를 달지 않는다. 세부 목표·과제 칸은 배지에 숫자 한 글자만 들어가는데, 여기만
        "가운데" 세 글자를 넣으려니 28px 배지에서 글자가 잘렸다. 어느 칸인지는 바로 옆
        caption("가운데 칸")이 이미 말해 준다.
      */
      /* 제목을 채우면 경고가 저절로 걷힌다 — 상태를 따로 끄지 않고 그릴 때 함께 본다. */
      const rejected = coreRejected && !title.trim()

      return (
        <PanelShell title="핵심 목표" caption="가운데 칸">
          <div
            className={cn(rejected && coreShaking && 'animate-shake')}
            /* 흔들림이 끝나면 스스로 끈다. 켜 둔 채로 두면 다음 거절에 다시 시작하지 않는다. */
            onAnimationEnd={() => setCoreShaking(false)}
          >
            <Field label="이루고 싶은 큰 목표 하나" hint="30자까지 쓸 수 있어요.">
              <Input
                ref={coreInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 건강한 몸 만들기"
                maxLength={30}
                autoFocus
                aria-invalid={rejected}
                aria-describedby={rejected ? 'core-required' : undefined}
                /*
                  클래스가 아니라 인라인 style 로 준다. Input 은 안에서 style 로 테두리 색을
                  칠하는데(`var(--border-hairline)`), 인라인 style 은 클래스를 항상 이기므로
                  `border-red-500` 을 붙여도 먹지 않는다. rest 로 넘긴 style 이 컴포넌트의
                  style 보다 뒤에 놓여 이쪽이 이긴다.

                  <p>평소 색까지 여기서 함께 정한다. 거절이 아닐 때 `undefined` 를 넘기면
                  <b>컴포넌트의 style 자체를 덮어써</b> 기본 테두리색이 사라진다.
                */
                style={{ borderColor: rejected ? '#ef4444' : 'var(--border-hairline)' }}
              />
            </Field>
          </div>

          {rejected && (
            <p
              id="core-required"
              role="alert"
              className="m-0 rounded-xl bg-red-500/10 px-3 py-2 text-center text-[11.5px] font-bold text-red-600 dark:text-red-400"
            >
              핵심 목표를 먼저 입력해 주세요.
            </p>
          )}

          <p className="muted m-0 text-[12.5px] font-medium leading-relaxed">
            핵심 목표를 정하면 둘레 8칸에 세부 목표를, 그 바깥에 실천 과제를 채웁니다.
          </p>

          {domains.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              disabled={!title.trim()}
              onClick={() => setSelected({ kind: 'domain', domainIndex: 0 })}
            >
              첫 세부 목표 채우기
            </Button>
          )}
        </PanelShell>
      )
    }

    if (selected.kind === 'domain') {
      const index = selected.domainIndex
      const domain = domains[index]
      const done = domain.subjects.filter((s) => s.title.trim()).length

      /*
        <b>머리말 박스를 두지 않는다.</b> 다른 모드는 PanelShell 로 제목·안내를 이고 있지만,
        세부 목표 모드에서는 그 자리가 하는 말이 바로 아래 입력과 겹친다 — 머리말의 제목이
        곧 입력칸의 값이고, "실천 과제 0/8" 은 아래 8줄을 보면 알 수 있다. 대신 번호 배지를
        입력 줄 왼쪽으로 옮겨, 지금 몇 번째 목표를 쓰는지는 그대로 남긴다.

        <p>이 화면에서 가장 오래 머무는 모드라 한 줄이라도 위로 당기면 과제 8줄이 더 보인다.
      */
      /* 핵심 목표와 같은 규칙 — 제목을 채우면 경고가 저절로 걷힌다. */
      const rejected = domainRejected === index && !domain.title.trim()

      return (
        <div className="flex h-full flex-col gap-4">
          <div
            className={cn(rejected && domainShaking && 'animate-shake')}
            onAnimationEnd={() => setDomainShaking(false)}
          >
            <p className="mb-1.5 text-[12.5px] font-bold text-[var(--text-muted)]">세부 목표</p>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-xl text-[13px] font-black text-white"
                style={{ background: domainColor(index) }}
              >
                {index + 1}
              </span>
              <Input
                ref={domainInputRef}
                value={domain.title}
                onChange={(e) =>
                  setDomains((prev) =>
                    prev.map((d, i) => (i === index ? { ...d, title: e.target.value } : d)),
                  )
                }
                placeholder="예) 규칙적인 운동"
                maxLength={20}
                aria-label={`세부 목표 ${index + 1}`}
                aria-invalid={rejected}
                aria-describedby={rejected ? 'domain-required' : undefined}
                /* 평소 색까지 함께 준다 — undefined 를 넘기면 Input 의 style 을 덮어써
                   기본 테두리색이 사라진다(핵심 목표 입력과 같은 이유). */
                style={{ borderColor: rejected ? '#ef4444' : 'var(--border-hairline)' }}
              />
              {done === 8 && domain.title.trim() && (
                <span
                  aria-label="채움"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
                >
                  <IconCheck className="size-3.5" />
                </span>
              )}
            </div>
          </div>

          {/*
            같은 자리에서 톤만 바꾼다. 과제를 눌러 거절당한 경우와 그냥 빈 목표에 들어온
            경우는 <b>사용자가 방금 무엇을 했는지</b>가 다르다 — 앞은 시도가 막힌 것이라
            빨강으로 알리고, 뒤는 아직 아무것도 안 한 것이라 안내로 둔다. 문구는 같으므로
            둘을 따로 띄우면 같은 말이 두 줄로 겹친다.
          */}
          {!domain.title.trim() && (
            <p
              id={rejected ? 'domain-required' : undefined}
              role={rejected ? 'alert' : undefined}
              className={cn(
                'm-0 rounded-xl px-3 py-2 text-center text-[11.5px] font-bold',
                rejected
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
              )}
            >
              세부 목표를 먼저 작성해주세요.
            </p>
          )}

          {/*
            <b>격자 카드가 높이의 기준이고, 이 목록이 남는 공간을 채운다.</b>

            <p>예전에는 `max-h-[368px]` 로 묶여 있었다. 카드는 옆 격자 카드 높이만큼 늘어나는데
            목록은 368px 에서 멈추니 8줄 중 4줄만 보이고 그 아래가 통째로 비었다. 이동 버튼은
            PanelNav 의 `mt-auto` 때문에 그 빈 공간 건너 맨 아래에 홀로 떨어져 있었다.

            <p>그런데 `flex-1` 만으로는 안 된다. 격자 행 높이는 각 칸의 <i>내용</i> 높이로
            정해지는데, flex 자식은 flex-basis 가 0 이어도 내용 높이를 그대로 보탠다 — 8줄이
            그대로 더해져 이번엔 오른쪽 카드가 격자 카드를 밀어 올린다. 그래서 목록을
            <b>absolute</b> 로 띄운다. 절대 위치는 부모 높이 계산에서 빠지므로 이 카드의 내용
            높이는 '머리말 + 이동 버튼'뿐이 되고, 늘 격자 카드가 행 높이를 정한다.

            <p>1024px 아래로 좁히면 한 컬럼이 되어 기준이 될 카드가 없다. 그때는 368px 로
            고정한다 — 절대 위치라 그냥 두면 높이가 0 이 되어 과제가 통째로 사라진다.
          */}
          <div className="relative h-[368px] lg:h-auto lg:min-h-0 lg:flex-1">
            <div
              ref={subjectListRef}
              className="no-scrollbar absolute inset-0 flex flex-col gap-2 overflow-y-auto pr-0.5"
            >
              {domain.subjects.map((sub, j) => (
                <SubjectRow
                  key={j}
                  index={j}
                  value={sub}
                  color={domainColor(index)}
                  disabled={!domain.title.trim()}
                  onChange={(patch) => patchSubject(index, j, patch)}
                />
              ))}
            </div>
          </div>

          <PanelNav
            prevLabel="이전 목표"
            nextLabel="다음 목표"
            onPrev={
              index > 0 ? () => setSelected({ kind: 'domain', domainIndex: index - 1 }) : undefined
            }
            onNext={
              index < 7 ? () => setSelected({ kind: 'domain', domainIndex: index + 1 }) : undefined
            }
          />
        </div>
      )
    }

    /*
      과제 칸을 눌렀을 때. 예전에는 "세부 목표 편집하기" 버튼만 보여줘서, 칸을 눌러도
      정작 그 칸을 채울 수 없었다. 누른 칸을 바로 입력하게 하고, 옆 칸으로 이동하는
      길도 같이 둔다.
    */
    const index = selected.domainIndex
    const subjectIndex = selected.subjectIndex
    const domain = domains[index]
    const sub = domain.subjects[subjectIndex]

    return (
      <PanelShell
        title={domain.title.trim() || `세부 목표 ${index + 1}`}
        caption={`과제 ${subjectIndex + 1} / 8`}
        chip={{ label: `${index + 1}`, color: domainColor(index) }}
        done={sub.title.trim().length > 0}
      >
        <SubjectRow
          index={subjectIndex}
          value={sub}
          color={domainColor(index)}
          autoFocus={Boolean(domain.title.trim())}
          disabled={!domain.title.trim()}
          inputRef={subjectInputRef}
          onChange={(patch) => patchSubject(index, subjectIndex, patch)}
        />

        {!domain.title.trim() && (
          <p className="m-0 rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[11.5px] font-bold text-amber-700 dark:text-amber-300">
            세부 목표를 먼저 작성해주세요.
          </p>
        )}

        <Button
          variant="quiet"
          size="sm"
          onClick={() => setSelected({ kind: 'domain', domainIndex: index })}
        >
          이 블록 8칸 한 번에 채우기
        </Button>

        <PanelNav
          prevLabel="이전 칸"
          nextLabel="다음 칸"
          onPrev={
            subjectIndex > 0
              ? () =>
                  setSelected({
                    kind: 'subject',
                    domainIndex: index,
                    subjectIndex: subjectIndex - 1,
                  })
              : undefined
          }
          onNext={
            subjectIndex < 7
              ? () =>
                  setSelected({
                    kind: 'subject',
                    domainIndex: index,
                    subjectIndex: subjectIndex + 1,
                  })
              : undefined
          }
        />
      </PanelShell>
    )
  })()

  return (
    <div className="flex flex-col gap-5">
      {/*
        제목 · 기본 설정 · 동작을 한 줄에 둔다.

        <p>예전에는 제목 아래 설명 한 줄, 그 아래 완성도 카드, 그리고 오른쪽 컬럼에 접이식
        '기본 설정' 카드까지 네 덩어리가 격자 위를 차지했다. 정작 이 화면에서 계속 보는 것은
        <b>격자</b>인데 그게 화면 아래로 밀려났다. 마감일과 공개 여부는 한 번 정하면 끝이라
        접었다 펴는 카드를 줄 만큼 무겁지 않다 — 머리말에 얹으면 한눈에 보이고 자리도 덜 쓴다.
      */}
      {/*
        각 묶음에 `shrink-0` 을 준다. 없으면 자리가 모자랄 때 flex 가 묶음을 <b>줄여서</b>
        맞추려 들고, 그 압력이 가장 먼저 라벨 글자를 접는다 — "마감일" 이 "마감 / 일" 로
        쪼개져 머리말 높이까지 밀어 올렸다. 줄이지 못하게 하면 대신 flex-wrap 이 묶음
        단위로 다음 줄에 내려 보내므로, 좁아져도 글자는 온전히 남는다.
      */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <h1 className="page-title m-0 shrink-0">새 만다라트</h1>

        <div className="flex shrink-0 items-center gap-2.5">
          <label
            htmlFor="sheet-expired-at"
            className="whitespace-nowrap text-[12.5px] font-bold text-[var(--text-muted)]"
          >
            마감일
          </label>
          {/*
            폭은 감싸는 칸이 정한다. Input 에 직접 `w-[172px]` 을 줘도 CONTROL 의 `w-full` 이
            함께 남아 어느 쪽이 이길지 CSS 순서에 달리고, 실제로 100% 로 잡혀 옆 라벨을
            짓눌렀다(Primitives 의 CONTROL 주석이 경고하는 바로 그 함정이다).
            부모에 폭을 주면 w-full 이 그 폭을 채우므로 다투지 않는다.
          */}
          <div className="w-[168px] shrink-0">
            <Input
              id="sheet-expired-at"
              type="date"
              value={expiredAt}
              min={TODAY}
              onChange={(e) => setExpiredAt(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="whitespace-nowrap text-[12.5px] font-bold text-[var(--text-muted)]">
            공개 여부
          </span>
          <Segmented
            size="sm"
            value={isOpen ? 'public' : 'private'}
            onChange={(v) => setIsOpen(v === 'public')}
            options={[
              { value: 'public', label: '공개' },
              { value: 'private', label: '비공개' },
            ]}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            onClick={() =>
              status.filled === 0 ? navigate('/app/sheets') : setCancelOpen(true)
            }
          >
            취소
          </Button>

          {/*
            편집기에 들어오면 AI 로 채울 길이 끊겼다는 지적을 받은 자리. 방식 선택 팝업은
            처음 한 번만 떴고, 닫은 뒤에는 코치로 갈 방법이 화면에 없었다. 여기 상시로 두고
            누르면 쓰던 초안을 보관한 채 다녀온다 — 돌아오면 빈 칸에만 제안을 채워 준다.
          */}
          <Button variant="ai" onClick={goToCoach}>
            <IconSparkle className="size-4" /> AI 코치로 이어 만들기
          </Button>
          <Button onClick={() => setConfirmOpen(true)} disabled={!status.complete || saving}>
            {status.complete ? '저장하기' : `${81 - status.filled}칸 남음`}
          </Button>
        </div>
      </header>

      {/*
        되살렸다는 사실을 말해 준다. 아무 말 없이 지난 내용이 채워져 있으면 "왜 이게 여기
        있지" 부터 의심하게 되고, 반대로 빈 화면을 기대한 사람에게는 되돌릴 길이 필요하다.
      */}
      {restoreNotice && restored && (
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-4 py-3"
          style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-sunken)' }}
        >
          <span className="min-w-0 flex-1 text-[12.5px] font-bold">
            쓰던 초안 {restored.filled}칸을 되살렸어요
            {restored.savedAt && (
              <span className="muted font-semibold"> · {fromNow(restored.savedAt)} 저장</span>
            )}
          </span>

          <Button variant="quiet" size="sm" onClick={() => setResetOpen(true)}>
            처음부터 새로 만들기
          </Button>
          <button
            type="button"
            onClick={() => setRestoreNotice(false)}
            aria-label="안내 닫기"
            className="grid size-8 shrink-0 place-items-center rounded-full text-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="card p-4 sm:p-6">
          <MandalartGrid
            sheet={preview}
            selected={selected}
            onSelect={selectCell}
            isLocked={isCellLocked}
          />
        </section>

        {/* 마감일·공개 여부가 머리말로 올라가, 오른쪽 컬럼에는 편집기만 남는다. */}
        <section className="card p-6">{editor}</section>
      </div>

      {/* 만드는 방식 선택 */}
      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="어떻게 만들까요?"
        description="81칸을 빈 화면으로 마주하지 않아도 됩니다."
        size="sm"
      >
        <div className="grid gap-3">
          <button
            type="button"
            /* 작성 중에 다시 열 수도 있다. 쓰던 초안을 보관한 뒤 넘어간다. */
            onClick={goToCoach}
            className="flex items-start gap-4 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-sky-300"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {/* AI 가 하는 일은 청록으로 갈라 둔다 — 헤더의 "AI 코치로 이어 만들기" 버튼과 같은 색이다. */}
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white"
            >
              <IconSparkle />
            </span>
            <span className="min-w-0">
              <strong className="block text-[14.5px] font-extrabold">
                AI 코치와 대화로 만들기
              </strong>
              <span className="muted mt-1 block text-[12.5px] font-medium leading-relaxed">
                하고 싶은 것을 말하면 코치가 세부 목표와 과제를 제안합니다. 64칸을 혼자 떠올리는
                것보다 훨씬 빠릅니다.
              </span>
              <span className="mt-2 inline-block rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 px-2.5 py-1 text-[11.5px] font-black text-white">
                추천
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="flex items-start gap-4 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-2xl text-xl"
              style={{ background: 'var(--surface-sunken)' }}
            >
              ✍️
            </span>
            <span className="min-w-0">
              <strong className="block text-[14.5px] font-extrabold">직접 채워 넣기</strong>
              <span className="muted mt-1 block text-[12.5px] font-medium leading-relaxed">
                이미 목표가 정리돼 있다면 칸을 눌러 바로 적어도 됩니다. 격자에서 칸을 누르면
                오른쪽에 입력창이 열립니다.
              </span>
            </span>
          </button>

          {/*
            두 방법이 갈림길처럼 보이면 한쪽을 고른 뒤 막혔을 때 되돌아갈 생각을 못 한다.
            섞어 쓸 수 있다는 것을 여기서 분명히 말해 둔다.
          */}
          <p className="muted m-0 px-1 text-[12px] font-medium leading-relaxed">
            둘을 섞어도 됩니다 — 직접 쓰다가 <b>AI 코치로 이어 만들기</b>로 다녀오면 쓴 내용은
            그대로 두고 빈 칸만 채워 줍니다. 작성 중인 내용은 자동으로 보관돼요.
          </p>
        </div>
      </Modal>

      {/*
        코치를 다녀왔다. 쓰던 초안과 코치 제안 중 무엇을 살릴지는 사람만 안다.
        기본값(첫 버튼)은 잃는 것이 없는 쪽 — 빈 칸에만 채우기다.
      */}
      <Modal
        open={mergeAsk}
        /* ESC·배경 클릭으로 닫아도 잃는 것이 없는 쪽으로 처리한다 — 코치 제안을 그냥 버리면
           사용자는 "가져오기" 를 눌렀는데 아무 일도 안 난 것처럼 보인다. */
        onClose={applyCoachMerge}
        title="코치 제안을 어떻게 넣을까요?"
        description={
          restored
            ? `쓰던 초안 ${restored.filled}칸이 그대로 있습니다. 코치가 제안한 과제를 빈 칸에만 넣으면 쓴 내용은 하나도 지워지지 않아요.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={replaceWithCoach}>
              코치 제안으로 새로 시작
            </Button>
            <Button size="sm" onClick={applyCoachMerge}>
              빈 칸에만 채우기
            </Button>
          </>
        }
      />

      {/* 취소 — 보관한 초안까지 지우므로 사이드바 이탈보다 강하게 묻는다 */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="작성을 그만둘까요?"
        description={`지금까지 채운 ${status.filled}칸이 지워집니다. 잠깐 다른 화면을 보고 올 거라면 취소 대신 왼쪽 메뉴로 이동하세요 — 그때는 초안이 남아 있어요.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCancelOpen(false)}>
              계속 작성하기
            </Button>
            <Button variant="danger" size="sm" onClick={discardAndLeave}>
              지우고 나가기
            </Button>
          </>
        }
      />

      {/* 되살린 초안 버리기 — 81칸이 한 번에 비므로 되돌릴 수 없다고 분명히 말한다 */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="쓰던 내용을 지우고 새로 시작할까요?"
        description="되살린 초안이 사라집니다. 이 동작은 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(false)}>
              계속 이어 쓰기
            </Button>
            <Button variant="danger" size="sm" onClick={resetDraft}>
              지우고 새로 시작
            </Button>
          </>
        }
      />

      {/* 저장 확인 — 되돌릴 수 없는 동작이라 한 번 더 묻는다 */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="이대로 저장할까요?"
        description="저장하면 핵심 목표·세부 목표·실천 과제를 더 이상 고칠 수 없습니다."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
              더 다듬기
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void save()}>
              {saving ? '저장 중…' : '저장하기'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface-sunken)' }}>
            <p className="muted m-0 text-[11.5px] font-bold">핵심 목표</p>
            <p className="m-0 mt-1 text-[15px] font-extrabold">{title}</p>
          </div>
          <ul className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2">
            {domains.map((d, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-bold"
                style={{ background: 'var(--surface-sunken)' }}
              >
                <span className="min-w-0 flex-1 truncate">{d.title}</span>
                <span className="muted shrink-0">8</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  )
}
