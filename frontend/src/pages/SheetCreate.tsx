import { useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { PERIOD_MAX_COUNT, type Period, type Sheet } from '../data/types'
import MandalartGrid, { type CellRef } from '../features/sheet/MandalartGrid'
import Button from '../components/common/ActionButton'
import Modal from '../components/common/Modal'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconSparkle,
} from '../components/common/Icons'
import { Field, Input, ProgressBar, Segmented, domainColor } from '../components/common/Primitives'
import { cn } from '../utils/cn'

type DraftSubject = {
  title: string
  period: Period
  /** 한 주기에 몇 번 할지. 주기가 바뀌면 그 주기의 상한으로 잘린다. */
  countPerPeriod: number
}
type DraftDomain = { title: string; subjects: DraftSubject[] }

const EMPTY: DraftDomain[] = Array.from({ length: 8 }, () => ({
  title: '',
  subjects: Array.from({ length: 8 }, () => ({
    title: '',
    period: 'DAILY' as Period,
    countPerPeriod: 1,
  })),
}))

const TODAY = new Date().toISOString().slice(0, 10)
const IN_SIX_MONTHS = new Date(Date.now() + 1000 * 60 * 60 * 24 * 182).toISOString().slice(0, 10)

/** AI 코치에서 넘어올 때 실려 오는 초안. */
type CoachDraft = {
  title?: string
  domains?: Array<{ title: string; subjects: Array<{ title: string; period: Period }> }>
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
            className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
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
  onChange,
}: {
  period: Period
  value: number
  onChange: (next: number) => void
}) {
  const max = PERIOD_MAX_COUNT[period]
  const fixed = max <= 1

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
  onChange,
}: {
  index: number
  value: DraftSubject
  color: string
  autoFocus?: boolean
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
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`과제 ${index + 1}`}
          maxLength={40}
          autoFocus={autoFocus}
          aria-label={`과제 ${index + 1} 제목`}
          className="h-10 min-w-0 flex-1 rounded-xl border bg-[var(--surface-card)] px-3 text-[13px] font-semibold text-[var(--text-strong)] outline-none transition-colors placeholder:font-medium placeholder:text-[var(--text-muted)] focus:border-brand-400"
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

  /**
   * 코치가 만들어 준 초안으로 시작한다.
   *
   * 코치는 8×8 을 다 채우지 못할 수도 있어서(대화가 짧게 끝나면) 여기서 이어 채운다.
   * 저장 조건은 어느 경로로 들어왔든 똑같이 81칸이다.
   */
  const seeded = location.state as CoachDraft | null

  const [pickerOpen, setPickerOpen] = useState(!seeded)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [title, setTitle] = useState(seeded?.title ?? '')
  const [expiredAt, setExpiredAt] = useState(IN_SIX_MONTHS)
  const [isOpen, setIsOpen] = useState(true)
  /** 기본 설정 접힘. 처음 한 번 정하면 다시 볼 일이 드물어 펼친 채로 시작한다. */
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [domains, setDomains] = useState<DraftDomain[]>(() => {
    if (!seeded?.domains?.length) return EMPTY
    return EMPTY.map((empty, i) => {
      const from = seeded.domains?.[i]
      if (!from) return empty
      return {
        title: from.title ?? '',
        // 코치 초안에는 주기당 횟수가 없다. 기본 1회로 채우고 사용자가 조정한다.
        subjects: empty.subjects.map((slot, j) => {
          const s = from.subjects?.[j]
          return s ? { ...slot, title: s.title, period: s.period } : slot
        }),
      }
    })
  })
  const [selected, setSelected] = useState<CellRef | null>(
    seeded ? { kind: 'domain', domainIndex: 0 } : { kind: 'core' },
  )
  const [saving, setSaving] = useState(false)

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
    if (id != null) navigate(`/app/sheets/${id}`, { replace: true })
  }

  const jumpToIncomplete = () => {
    const first = status.incomplete[0]
    if (!title.trim()) {
      setSelected({ kind: 'core' })
      return
    }
    if (first) setSelected({ kind: 'domain', domainIndex: first.index })
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
      return (
        <PanelShell
          title="핵심 목표"
          caption="가운데 칸"
          chip={{ label: '가운데', color: 'var(--color-brand-600)' }}
        >
          <Field label="이루고 싶은 큰 목표 하나" hint="30자까지 쓸 수 있어요.">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 건강한 몸 만들기"
              maxLength={30}
              autoFocus
            />
          </Field>

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

      return (
        <PanelShell
          title={domain.title.trim() || `세부 목표 ${index + 1}`}
          caption={`실천 과제 ${done}/8`}
          chip={{ label: `${index + 1}`, color: domainColor(index) }}
          done={done === 8 && Boolean(domain.title.trim())}
        >
          <Field label="세부 목표" hint="핵심 목표를 이루기 위한 갈래 하나입니다.">
            <Input
              value={domain.title}
              onChange={(e) =>
                setDomains((prev) =>
                  prev.map((d, i) => (i === index ? { ...d, title: e.target.value } : d)),
                )
              }
              placeholder="예) 규칙적인 운동"
              maxLength={20}
            />
          </Field>

          <div>
            <p className="muted m-0 mb-2 text-[12px] font-bold">실천 과제 8개</p>
            {/*
              8줄이 한 번에 보이면 패널이 화면을 넘어가 저장 버튼까지 밀린다.
              스크롤 영역으로 묶고 스크롤바는 숨긴다.
            */}
            <div className="no-scrollbar flex max-h-[368px] flex-col gap-2 overflow-y-auto pr-0.5">
              {domain.subjects.map((sub, j) => (
                <SubjectRow
                  key={j}
                  index={j}
                  value={sub}
                  color={domainColor(index)}
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
        </PanelShell>
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
          autoFocus
          onChange={(patch) => patchSubject(index, subjectIndex, patch)}
        />

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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">새 만다라트</h1>
          <p className="page-caption">
            가운데에 핵심 목표, 둘레에 세부 목표 8개, 그 바깥에 실천 과제 64개를 적습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/app/sheets')}>
            취소
          </Button>
          <Button onClick={() => setConfirmOpen(true)} disabled={!status.complete || saving}>
            {status.complete ? '저장하기' : `${81 - status.filled}칸 남음`}
          </Button>
        </div>
      </header>

      {/*
        수정 불가 안내. 예전에는 우측 사이드바에 노란 경고 박스로 있었는데, 정작 보라는
        시점(저장 직전)에는 스크롤 밖이었고 색만 강해 화면을 어지럽혔다.
        제목 바로 아래 한 줄로 두면 만들기 시작할 때 자연스럽게 읽힌다.
      */}
      <p className="muted m-0 text-center text-[12px] font-bold">
        저장하면 내용을 고칠 수 없어요 · 공개 여부만 나중에 바꿀 수 있습니다
      </p>

      {/*
        완성도. 예전에는 상태에 따라 테두리·배경색이 통째로 바뀌는 색 박스였는데,
        그 색이 아래 카드들과 겹쳐 화면이 시끄러웠고 진행 막대까지 들어가 높이도 컸다.
        흰 카드 한 줄에 숫자 셋과 얇은 막대만 남긴다 — 필요한 정보는 "몇 칸 남았나"뿐이다.
      */}
      <section className="card flex flex-wrap items-center gap-x-6 gap-y-4 p-5">
        <div className="flex items-baseline gap-2">
          <strong className="text-2xl font-black tabular-nums tracking-[-0.04em]">
            {status.filled}
          </strong>
          <span className="muted text-[13px] font-bold">/ 81칸</span>
        </div>

        <div className="min-w-[200px] flex-1">
          <ProgressBar value={(status.filled / 81) * 100} label="만다라트 완성도" />
          <p className="muted m-0 mt-2 text-[11.5px] font-semibold">
            핵심 목표 {title.trim() ? 1 : 0}/1 · 세부 목표 {status.domainDone}/8 · 실천 과제{' '}
            {status.subjectDone}/64
          </p>
        </div>

        {status.complete ? (
          <span className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-emerald-600 dark:text-emerald-400">
            <IconCheck className="size-4" /> 모두 채웠어요
          </span>
        ) : (
          <Button variant="secondary" size="sm" onClick={jumpToIncomplete}>
            덜 채운 칸으로
          </Button>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="card p-4 sm:p-6">
          <MandalartGrid sheet={preview} selected={selected} onSelect={setSelected} />

          {/* 블록별 완성 상태 */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {domains.map((d, i) => {
              const done = d.subjects.filter((s) => s.title.trim()).length
              const full = Boolean(d.title.trim()) && done === 8
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected({ kind: 'domain', domainIndex: i })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors',
                    full ? 'text-white' : 'text-[var(--text-muted)]',
                  )}
                  style={{
                    background: full ? domainColor(i) : 'var(--surface-sunken)',
                  }}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: full ? 'rgba(255,255,255,.8)' : domainColor(i) }}
                    aria-hidden="true"
                  />
                  <span className="max-w-[120px] truncate">
                    {d.title.trim() || `목표 ${i + 1}`}
                  </span>
                  <span className="tabular-nums opacity-80">{done}/8</span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          {/*
            기본 설정은 처음 한 번 정하면 다시 볼 일이 드물다. 접어 두면 그만큼
            '선택한 칸'이 위로 올라와, 81칸을 채우는 동안 눈이 덜 움직인다.
          */}
          <section className="card p-6">
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-expanded={settingsOpen}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <h2 className="section-title m-0">기본 설정</h2>
              <span className="muted flex items-center gap-2 text-[11.5px] font-bold">
                {!settingsOpen && <span>{isOpen ? '공개' : '비공개'}</span>}
                <IconChevronDown
                  className={cn(
                    'size-4 transition-transform duration-200 motion-reduce:transition-none',
                    settingsOpen && 'rotate-180',
                  )}
                />
              </span>
            </button>

            {/*
              grid-template-rows 0fr ↔ 1fr 로 여닫는다. max-height 로 하면 실제 높이를
              모르니 넉넉한 값을 넣게 되고, 그만큼 열릴 때 빠르고 닫힐 때 늦는 어긋난
              속도가 된다. 이 방식은 내용이 몇 줄이든 같은 속도로 움직인다.
            */}
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                settingsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-4 flex flex-col gap-4">
                  <Field label="마감일" hint="이 날짜까지를 한 주기로 봅니다.">
                    <Input
                      type="date"
                      value={expiredAt}
                      min={TODAY}
                      onChange={(e) => setExpiredAt(e.target.value)}
                      aria-label="마감일"
                    />
                  </Field>

                  <Field label="공개 여부" hint="이것만은 나중에 바꿀 수 있어요.">
                    <Segmented
                      value={isOpen ? 'public' : 'private'}
                      onChange={(v) => setIsOpen(v === 'public')}
                      options={[
                        { value: 'public', label: '공개' },
                        { value: 'private', label: '비공개' },
                      ]}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </section>

          <section className="card flex-1 p-6">{editor}</section>
        </div>
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
            onClick={() => navigate('/app/coach')}
            className="flex items-start gap-4 rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500/12 text-brand-600 dark:text-brand-400"
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
              <span className="mt-2 inline-block text-[12px] font-black text-brand-600 dark:text-brand-400">
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
                이미 목표가 정리돼 있다면 칸을 눌러 바로 적어도 됩니다.
              </span>
            </span>
          </button>
        </div>
      </Modal>

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
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: domainColor(i) }}
                  aria-hidden="true"
                />
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
