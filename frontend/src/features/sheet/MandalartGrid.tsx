import { useMemo } from 'react'
import type { Sheet, Subject } from '../../data/types'
import { domainColor } from '../../components/common/Primitives'
import { cn } from '../../utils/cn'

export type CellRef =
  | { kind: 'core' }
  | { kind: 'domain'; domainIndex: number }
  | { kind: 'subject'; domainIndex: number; subjectIndex: number }
  | { kind: 'empty'; domainIndex: number; subjectIndex: number }

/** 블록 좌표 → 도메인 position. 마을(IsoVillage)과 같은 배치를 쓴다. */
const BLOCK_TO_DOMAIN: Record<string, number> = {
  '0,0': 0,
  '1,0': 1,
  '2,0': 2,
  '0,1': 3,
  '2,1': 4,
  '0,2': 5,
  '1,2': 6,
  '2,2': 7,
}

type Props = {
  sheet: Sheet
  selected?: CellRef | null
  onSelect?: (ref: CellRef) => void
  /** 생성 화면에서 상위 목표를 쓰기 전 잠긴 칸. 클릭은 상위 입력으로 안내하기 위해 유지한다. */
  isLocked?: (ref: CellRef) => boolean
  /** 목록 카드용 초소형 뷰 — 글자 없이 색만 */
  mini?: boolean
  /**
   * 핵심 목표와 세부 목표 이름만 남기고 과제 64칸의 글자는 지운다.
   *
   * <p>격자를 작게 줄여 보여 주는 자리(소개 페이지)에서는 81칸에 글자가 다 들어가면
   * 4~5px 짜리 글씨가 빼곡해 읽히지도 않고 구조만 가린다. 색과 채움 높이는 그대로 두므로
   * "무엇이 얼마나 찼는지"는 여전히 보인다.
   */
  headingsOnly?: boolean
  /**
   * 안내(오버레이 투어)가 <b>격자의 한 겹만</b> 가리킬 수 있게 자리를 잡아 준다.
   *
   * <p>81칸은 9x9 로 한 줄씩 늘어놓은 것이라, "가운데 블록 3x3" 처럼 <b>블록 하나</b>에
   * 해당하는 요소가 DOM 에 없다. 안내는 요소 하나의 사각형에 구멍을 뚫으므로 가리킬 것이
   * 없으면 격자 전체를 감싸는 수밖에 없고, 그러면 세 겹을 따로 설명할 수 없다.
   *
   * <p>그래서 <b>보이지 않는 표식</b>을 겹쳐 둔다. `position:absolute` 라 격자 배치에서
   * 아예 빠지고(그리드 항목이 아니다), 클릭도 받지 않는다 — 81칸의 자리·크기·조작은 그대로다.
   *
   * <p>편집기에서만 켠다. 목록 카드나 상세 화면에도 같은 격자가 뜨는데, 같은 표식이 여러 개면
   * 안내가 엉뚱한 격자에 구멍을 뚫는다.
   */
  tourAnchors?: boolean
  className?: string
}

/**
 * 만다라트 9x9. 어느 화면에서든 정사각형을 유지하고 폭에 맞춰 글자가 줄어든다.
 * 칸의 채움 높이는 서버가 준 `progress`(0~100)를 그대로 쓴다.
 */
export default function MandalartGrid({
  sheet,
  selected,
  onSelect,
  isLocked,
  mini,
  headingsOnly,
  tourAnchors,
  className,
}: Props) {
  const cells = useMemo(() => {
    const domains = sheet.domains ?? []
    const byPosition = new Map(domains.map((d) => [d.position, d]))

    const rows: Array<{
      key: string
      ref: CellRef
      label: string
      domainIndex: number
      progress: number
      isBlockCenter: boolean
      isCore: boolean
    }> = []

    for (let gy = 0; gy < 9; gy += 1) {
      for (let gx = 0; gx < 9; gx += 1) {
        const bx = Math.floor(gx / 3)
        const by = Math.floor(gy / 3)
        const cx = gx % 3
        const cy = gy % 3
        const isCenterBlock = bx === 1 && by === 1
        const isBlockCenter = cx === 1 && cy === 1

        if (isCenterBlock && isBlockCenter) {
          rows.push({
            key: `${gx}-${gy}`,
            ref: { kind: 'core' },
            label: sheet.title || '핵심 목표',
            domainIndex: -1,
            progress: 0,
            isBlockCenter: true,
            isCore: true,
          })
          continue
        }

        if (isCenterBlock) {
          const localIndex = cy * 3 + cx
          const domainIndex = localIndex > 4 ? localIndex - 1 : localIndex
          rows.push({
            key: `${gx}-${gy}`,
            ref: { kind: 'domain', domainIndex },
            label: byPosition.get(domainIndex)?.title ?? '',
            domainIndex,
            progress: 0,
            isBlockCenter: false,
            isCore: false,
          })
          continue
        }

        const domainIndex = BLOCK_TO_DOMAIN[`${bx},${by}`]
        const domain = byPosition.get(domainIndex)

        if (isBlockCenter) {
          rows.push({
            key: `${gx}-${gy}`,
            ref: { kind: 'domain', domainIndex },
            label: domain?.title ?? '',
            domainIndex,
            progress: 0,
            isBlockCenter: true,
            isCore: false,
          })
          continue
        }

        const localIndex = cy * 3 + cx
        const subjectIndex = localIndex > 4 ? localIndex - 1 : localIndex
        /*
          배열 순서가 아니라 `position` 으로 찾는다.

          생성 화면의 미리보기는 아직 안 쓴 칸을 걸러낸 배열을 넘긴다(8칸이 아니다). 인덱스로
          집으면 첫 칸을 비워 두고 세 번째 과제만 적었을 때 그 과제가 <b>첫 칸에</b> 그려졌다.
          바로 위 도메인도 이미 position 으로 찾고 있으니 규칙을 하나로 맞춘다.
        */
        const subject: Subject | undefined = domain?.subjects.find(
          (s) => s.position === subjectIndex,
        )

        rows.push({
          key: `${gx}-${gy}`,
          ref: subject
            ? { kind: 'subject', domainIndex, subjectIndex }
            : { kind: 'empty', domainIndex, subjectIndex },
          label: subject?.title ?? '',
          domainIndex,
          progress: subject?.progress ?? 0,
          isBlockCenter: false,
          isCore: false,
        })
      }
    }
    return rows
  }, [sheet])

  const isSelected = (ref: CellRef) => {
    if (!selected || ref.kind !== selected.kind) return false
    if (ref.kind === 'core') return true
    if (ref.kind === 'domain' && selected.kind === 'domain')
      return ref.domainIndex === selected.domainIndex
    if (
      (ref.kind === 'subject' || ref.kind === 'empty') &&
      (selected.kind === 'subject' || selected.kind === 'empty')
    ) {
      return ref.domainIndex === selected.domainIndex && ref.subjectIndex === selected.subjectIndex
    }
    return false
  }

  return (
    <div
      className={cn(
        'relative grid aspect-square w-full select-none grid-cols-9 grid-rows-9',
        /*
          글자 크기를 격자 자신의 폭에 맞춘다(아래 cqw). 예전에는 vw 를 썼는데, 그건
          격자가 화면 폭을 거의 다 쓸 때만 맞는 가정이다 — 소개 페이지처럼 격자를 작게
          줄여 놓으면 칸은 작아지는데 글자만 그대로라 칸 밖으로 넘친다.
        */
        '[container-type:inline-size]',
        mini ? 'gap-px' : 'gap-[2px] sm:gap-[3px]',
        className,
      )}
    >
      {cells.map((cell) => {
        const color = cell.domainIndex >= 0 ? domainColor(cell.domainIndex) : '#f59f00'
        const active = isSelected(cell.ref)
        const filled = cell.label.trim().length > 0
        const interactive = Boolean(onSelect) && !mini
        const locked = Boolean(isLocked?.(cell.ref))
        // 중앙 핵심 목표·세부 목표 칸은 잠겨 있어도 색을 흐리지 않는다.
        const visuallyLocked =
          locked && (cell.ref.kind === 'subject' || cell.ref.kind === 'empty')
        const lockedTitle =
          cell.ref.kind === 'domain'
            ? '핵심 목표를 먼저 작성해주세요.'
            : '세부 목표를 먼저 작성해주세요.'
        const title = locked ? lockedTitle : !mini && filled ? cell.label : undefined
        const background = cell.isCore
          ? 'linear-gradient(140deg, var(--color-brand-500), var(--color-brand-700))'
          : cell.isBlockCenter
            ? color
            : cell.ref.kind === 'domain' || filled
              ? `color-mix(in oklab, ${color}, var(--surface-card) 84%)`
              : 'var(--surface-sunken)'

        /*
          강조 테두리 색. 배경이 진한 칸(핵심 목표·블록 중앙)에 같은 색 테두리를 그리면
          아무것도 안 보인다 — 그 칸만 흰 테두리로 바꾼다.
        */
        const ring = cell.isCore || cell.isBlockCenter ? 'rgba(255,255,255,.9)' : color

        return (
          <button
            key={cell.key}
            type="button"
            disabled={!interactive}
            /* 가운데 한 칸은 그 자체가 요소라 따로 표식을 겹칠 것 없이 여기에 붙인다. */
            data-tour={tourAnchors && cell.isCore ? 'grid-core' : undefined}
            /*
              칸이 좁아 글자가 세 줄에서 잘린다(line-clamp-3). 예전에는 hover 확대가 그걸
              메우는 역할을 겸했는데, 확대를 걷어냈으므로 전체 문구는 툴팁으로 보여 준다.
            */
            title={title}
            aria-label={
              cell.isCore
                ? `핵심 목표 ${cell.label}`
                : cell.ref.kind === 'domain'
                  ? `세부 목표 ${cell.label || '비어 있음'}`
                  : `${cell.label || '빈 칸'}${cell.progress > 0 ? `, ${cell.progress}% 진행` : ''}`
            }
            aria-pressed={active}
            aria-disabled={locked || undefined}
            onClick={() => onSelect?.(cell.ref)}
            className={cn(
              'relative flex items-center justify-center overflow-hidden p-[2px] text-center',
              mini ? 'rounded-[2px]' : 'rounded-[5px] sm:rounded-[7px]',
              'transition-[box-shadow] duration-200',
              /*
                강조를 칸 <b>안쪽에만</b> 그린다.

                예전에는 hover·선택에 `scale(1.06)` + 바깥 그림자 + `z-10` 을 썼다. 칸 사이가
                2~3px 뿐이라 확대분(칸 78px 기준 각 변 약 2.3px)과 그림자가 옆 칸을 덮었고,
                z-10 으로 위에 올라오면서 이웃 칸의 클릭 영역까지 가렸다 — 칸을 훑는 동안
                화면이 들썩이고 옆 칸이 눌리는 오조작이 났다.

                inset 테두리는 자리를 전혀 건드리지 않으면서 "지금 이 칸" 을 똑같이 알려 준다.
              */
              interactive && !locked && 'cursor-pointer hover:shadow-[inset_0_0_0_2px_var(--cell-ring)]',
              interactive && locked && 'cursor-not-allowed',
              visuallyLocked && 'opacity-45 grayscale-[.25]',
            )}
            style={{
              ['--cell-ring' as string]: ring,
              background,
              /* 선택된 칸은 hover 보다 굵게. inline 이라 hover 클래스를 덮는다 — 의도한 우선순위다. */
              boxShadow: active ? `inset 0 0 0 3px ${ring}` : undefined,
            }}
          >
            {!cell.isBlockCenter && !cell.isCore && cell.progress > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  height: `${Math.min(100, cell.progress)}%`,
                  background: `color-mix(in oklab, ${color}, transparent 62%)`,
                }}
              />
            )}

            {!mini && (!headingsOnly || cell.isCore || cell.isBlockCenter) && (
              <span
                className="relative z-10 line-clamp-3 break-keep font-bold leading-[1.15]"
                style={{
                  /* 격자 폭 기준. 데스크톱 앱(격자 ≈ 730px)에서 예전 값과 같은 크기가 나오도록 환산했다. */
                  fontSize: cell.isCore
                    ? 'clamp(6px, 2.05cqw, 15px)'
                    : cell.isBlockCenter
                      ? 'clamp(5px, 1.64cqw, 12px)'
                      : 'clamp(4px, 1.5cqw, 11px)',
                  color:
                    cell.isCore || cell.isBlockCenter
                      ? '#fff'
                      : filled
                        ? 'var(--text-strong)'
                        : 'var(--text-muted)',
                }}
              >
                {cell.label}
              </span>
            )}
          </button>
        )
      })}

      {/*
        블록 하나를 덮는 표식. 3분의 1씩 잘라 놓으면 칸 사이 여백(2~3px)만큼 어긋나는데,
        안내가 구멍에 여백을 더해 뚫으므로 눈에 띄지 않는다.
      */}
      {tourAnchors && (
        <>
          {/* 가운데 블록 — 핵심 목표 한 칸과 그 둘레의 세부 목표 8칸 */}
          <span
            aria-hidden="true"
            data-tour="grid-domains"
            className="pointer-events-none absolute left-1/3 top-1/3 h-1/3 w-1/3"
          />
          {/* 바깥 블록 하나 — 세부 목표 한 개와 그에 딸린 실천 과제 8칸 */}
          <span
            aria-hidden="true"
            data-tour="grid-subjects"
            className="pointer-events-none absolute left-0 top-0 h-1/3 w-1/3"
          />
        </>
      )}
    </div>
  )
}
