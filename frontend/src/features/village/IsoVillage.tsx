import { useId, useMemo, useState } from 'react'
import type { Sheet, Subject, Terrain } from '../../data/types'
import { stageOf } from '../../data/store'
import { domainColor } from '../../components/common/Primitives'
import { landmarkStageFromPercent } from '../../village/partTypes'
import { cn } from '../../utils/cn'

/* 타일 한 칸의 화면 크기. 값을 바꾸면 마을 전체 축척이 같이 움직인다. */
const TW = 58
const TH = 29

/**
 * 만다라트 9x9 를 그대로 마을 지도로 쓴다.
 * 블록(3x3) 하나가 세부 목표, 블록 안 8칸이 과제(=건물 한 채), 블록 중앙은 간판,
 * 정중앙 블록은 핵심 목표를 상징하는 랜드마크다.
 */
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

const TERRAIN_STYLE: Record<Terrain, { base: string; edge: string; sky: [string, string] }> = {
  GRASS_PATH: { base: '#8ec98a', edge: '#6fae6d', sky: ['#dff3ff', '#f4fbf2'] },
  CITY_ROAD: { base: '#b9bfc7', edge: '#98a0aa', sky: ['#e8eefc', '#f7f8fb'] },
  WATER_WAY: { base: '#8fd0e0', edge: '#69b4c9', sky: ['#dff6ff', '#f0fbff'] },
  DIRT_ROAD: { base: '#d9b98c', edge: '#bd9a6c', sky: ['#fff2df', '#fdf8f0'] },
}

function iso(gx: number, gy: number): { x: number; y: number } {
  return { x: (gx - gy) * (TW / 2), y: (gx + gy) * (TH / 2) }
}

function tilePath(w = TW, h = TH): string {
  return `M 0 ${-h / 2} L ${w / 2} 0 L 0 ${h / 2} L ${-w / 2} 0 Z`
}

function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(amount > 0 ? c + (255 - c) * amount : c * (1 + amount))
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

/** 아이소 박스 하나. 윗면·왼면·오른면 세 장으로 입체를 만든다. */
function IsoBox({ w, h, color, y = 0 }: { w: number; h: number; color: string; y?: number }) {
  const hw = w / 2
  const hh = (w * TH) / TW / 2
  return (
    <g transform={`translate(0 ${y})`}>
      <path d={`M ${-hw} 0 L 0 ${hh} L 0 ${hh - h} L ${-hw} ${-h} Z`} fill={shade(color, -0.32)} />
      <path d={`M ${hw} 0 L 0 ${hh} L 0 ${hh - h} L ${hw} ${-h} Z`} fill={shade(color, -0.14)} />
      <path
        d={`M 0 ${-hh - h} L ${hw} ${-h} L 0 ${hh - h} L ${-hw} ${-h} Z`}
        fill={shade(color, 0.16)}
      />
    </g>
  )
}

const SHAPES = ['house', 'tower', 'block', 'dome', 'garden', 'spire'] as const
type Shape = (typeof SHAPES)[number]

function Building({ stage, color, shape }: { stage: 0 | 1 | 2 | 3; color: string; shape: Shape }) {
  if (stage === 0) {
    return (
      <path
        d={tilePath(TW * 0.62, TH * 0.62)}
        fill="none"
        stroke="rgba(255,255,255,.55)"
        strokeWidth={1.4}
        strokeDasharray="4 4"
      />
    )
  }

  if (stage === 1) {
    return (
      <g>
        <path d={tilePath(TW * 0.66, TH * 0.66)} fill={shade(color, 0.55)} opacity={0.85} />
        <IsoBox w={TW * 0.3} h={7} color={color} />
        <path
          d={`M ${-TW * 0.28} -2 L ${-TW * 0.28} -20`}
          stroke={shade(color, -0.2)}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d={`M ${-TW * 0.28} -19 L ${-TW * 0.02} -19`}
          stroke={shade(color, -0.2)}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    )
  }

  const tall = stage === 3
  const bodyH = tall ? 34 : 20
  const bodyW = TW * (tall ? 0.6 : 0.55)

  return (
    <g>
      <path d={tilePath(TW * 0.74, TH * 0.74)} fill={shade(color, 0.5)} opacity={0.55} />
      <IsoBox w={bodyW} h={bodyH} color={color} />

      {shape === 'tower' && tall && <IsoBox w={bodyW * 0.62} h={18} color={color} y={-bodyH} />}

      {shape === 'spire' && tall && (
        <path
          d={`M 0 ${-bodyH - 6} L ${bodyW * 0.24} ${-bodyH + 4} L 0 ${-bodyH + 30} L ${-bodyW * 0.24} ${-bodyH + 4} Z`}
          fill={shade(color, 0.3)}
        />
      )}

      {shape === 'dome' && tall && (
        <ellipse
          cx={0}
          cy={-bodyH + 2}
          rx={bodyW * 0.42}
          ry={bodyW * 0.3}
          fill={shade(color, 0.34)}
        />
      )}

      {shape === 'garden' && (
        <>
          <circle cx={-bodyW * 0.3} cy={-bodyH - 2} r={5.5} fill={shade('#2f9e44', 0.12)} />
          <circle cx={bodyW * 0.26} cy={-bodyH + 3} r={4.5} fill={shade('#2f9e44', 0.28)} />
        </>
      )}

      {(shape === 'house' || shape === 'block') && tall && (
        <path
          d={`M ${-bodyW / 2} ${-bodyH} L 0 ${-bodyH - 13} L ${bodyW / 2} ${-bodyH} L 0 ${-bodyH + (bodyW * TH) / TW / 2} Z`}
          fill={shade(color, 0.32)}
        />
      )}

      {tall && (
        <g opacity={0.9}>
          <rect x={-bodyW * 0.3} y={-bodyH + 6} width={5} height={5} fill="#fff8e1" rx={1} />
          <rect x={bodyW * 0.12} y={-bodyH + 11} width={5} height={5} fill="#fff8e1" rx={1} />
        </g>
      )}
    </g>
  )
}

/**
 * 정중앙 랜드마크. 전체 달성률 12.5% 마다 한 단계씩 자란다(0~8).
 *
 * 단계 계산은 3D 마을과 **같은 함수**를 쓴다. 예전에는 여기만 `floor(p/12.5)` 라 3D 와 한 단계
 * 어긋났고, 랜딩에서 본 성장과 앱에서 본 성장이 달랐다. `partTypes` 는 모델링 데이터가 없는
 * 스키마 모듈이라 2D 가 가져와도 번들이 무거워지지 않는다.
 */
function Landmark({ progress }: { progress: number }) {
  const level = landmarkStageFromPercent(progress)
  const color = '#f59f00'
  const h = 16 + level * 11

  return (
    <g>
      <path d={tilePath(TW * 2.1, TH * 2.1)} fill="rgba(255,255,255,.42)" />
      <IsoBox w={TW * 1.25} h={12} color="#e9ecef" />
      {level > 0 && <IsoBox w={TW * 0.86} h={h} color={color} y={-12} />}
      {level >= 4 && <IsoBox w={TW * 0.56} h={h * 0.5} color={color} y={-12 - h} />}
      {level >= 6 && (
        <path
          d={`M 0 ${-12 - h - h * 0.5 - 22} L 13 ${-12 - h - h * 0.5 + 2} L 0 ${-12 - h - h * 0.5 + 8} L -13 ${-12 - h - h * 0.5 + 2} Z`}
          fill={shade(color, 0.3)}
        />
      )}
      {level === 8 && (
        <circle cx={0} cy={-12 - h - h * 0.5 - 28} r={5} fill="#ffe066">
          <animate attributeName="r" values="5;6.5;5" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  )
}

type Props = {
  sheet: Sheet
  onSelectSubject?: (subject: Subject, domainPosition: number) => void
  selectedSubjectId?: number | null
  compact?: boolean
  /**
   * 하늘 배경을 그리지 않고 마을만 얹는다.
   *
   * <p>기본값은 자기 하늘을 칠하는 것이다 — 카드(흰 배경) 안에서는 그래야 마을이
   * 하나의 그림으로 읽힌다. 반대로 <b>색이 있는 배경</b> 위에 올릴 때는 그 하늘색
   * 사각형이 밝은 판처럼 떠서 배경과 부딪힌다. 그럴 때 이걸 켠다.
   */
  transparent?: boolean
  className?: string
}

export default function IsoVillage({
  sheet,
  onSelectSubject,
  selectedSubjectId,
  compact = false,
  transparent = false,
  className,
}: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const terrain = TERRAIN_STYLE[sheet.terrain ?? 'GRASS_PATH'] ?? TERRAIN_STYLE.GRASS_PATH

  /*
    그라데이션 id 는 인스턴스마다 달라야 한다. SVG 의 url(#...) 은 문서 전체에서 찾으므로
    고정 id 를 쓰면 한 화면에 마을이 여러 개일 때(소개 페이지) 전부 첫 번째 것의 하늘을
    쓰게 되고, 지형을 다르게 줘도 색이 따라오지 않는다.
  */
  const uid = useId().replace(/:/g, '')
  const skyId = `sky-${uid}`
  const glowId = `glow-${uid}`

  const progress = sheet.progress ?? sheet.achievementRate

  /** 그리는 순서 = 뒤에서 앞으로. 안 그러면 뒤 건물이 앞 건물을 덮는다. */
  const cells = useMemo(() => {
    const byPosition = new Map((sheet.domains ?? []).map((d) => [d.position, d]))

    const list: Array<{
      key: string
      gx: number
      gy: number
      kind: 'landmark' | 'sign' | 'plot' | 'empty'
      domainIndex: number
      subject?: Subject
      domainTitle?: string
    }> = []

    for (let gy = 0; gy < 9; gy += 1) {
      for (let gx = 0; gx < 9; gx += 1) {
        const bx = Math.floor(gx / 3)
        const by = Math.floor(gy / 3)
        const cx = gx % 3
        const cy = gy % 3

        if (bx === 1 && by === 1) {
          if (cx === 1 && cy === 1) {
            list.push({ key: 'landmark', gx, gy, kind: 'landmark', domainIndex: -1 })
          }
          continue
        }

        const domainIndex = BLOCK_TO_DOMAIN[`${bx},${by}`]
        const domain = byPosition.get(domainIndex)

        if (cx === 1 && cy === 1) {
          list.push({
            key: `sign-${domainIndex}`,
            gx,
            gy,
            kind: 'sign',
            domainIndex,
            domainTitle: domain?.title,
          })
          continue
        }

        const localIndex = cy * 3 + cx
        const subjectIndex = localIndex > 4 ? localIndex - 1 : localIndex
        const subject = domain?.subjects[subjectIndex]

        list.push({
          key: `${gx}-${gy}`,
          gx,
          gy,
          kind: subject ? 'plot' : 'empty',
          domainIndex,
          subject,
        })
      }
    }

    return list.sort((a, b) => a.gx + a.gy - (b.gx + b.gy))
  }, [sheet])

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <svg
        viewBox="-320 -150 640 480"
        className="h-full w-full"
        role="img"
        aria-label={`${sheet.title} 마을. 전체 달성률 ${progress}퍼센트`}
      >
        <defs>
          {!transparent && (
            <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={terrain.sky[0]} />
              <stop offset="100%" stopColor={terrain.sky[1]} />
            </linearGradient>
          )}
          <radialGradient id={glowId} cx="50%" cy="46%" r="52%">
            {/*
              배경을 깔지 않을 때는 빛무리를 옅게 준다. 진하게 두면 색 있는 배경 위에
              뿌연 흰 얼룩이 남아, 없애려던 "떠 있는 판"이 경계만 흐려진 채 그대로다.
            */}
            <stop offset="0%" stopColor={`rgba(255,255,255,${transparent ? '.22' : '.85'})`} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {!transparent && (
          <rect x="-320" y="-150" width="640" height="480" fill={`url(#${skyId})`} />
        )}
        <ellipse cx="0" cy="128" rx="300" ry="180" fill={`url(#${glowId})`} />
        <ellipse
          cx="0"
          cy="140"
          rx="278"
          ry="146"
          fill={transparent ? 'rgba(20,10,5,.13)' : 'rgba(35,50,60,.10)'}
        />

        {cells.map((cell) => {
          const { x, y } = iso(cell.gx, cell.gy)
          const color = cell.domainIndex >= 0 ? domainColor(cell.domainIndex) : '#f59f00'
          const isHover = hover === cell.key
          const isSelected = cell.subject?.id === selectedSubjectId
          const interactive = Boolean(onSelectSubject && cell.subject)

          return (
            <g
              key={cell.key}
              transform={`translate(${x} ${y + (isHover && interactive ? -5 : 0)})`}
              style={{ transition: 'transform .2s cubic-bezier(0.22,1,0.36,1)' }}
              className={interactive ? 'cursor-pointer' : undefined}
              onMouseEnter={() => interactive && setHover(cell.key)}
              onMouseLeave={() => interactive && setHover(null)}
              onClick={() => {
                if (cell.subject && onSelectSubject) onSelectSubject(cell.subject, cell.domainIndex)
              }}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={
                cell.subject
                  ? `${cell.subject.title}, ${cell.subject.tryCount}/${cell.subject.targetCount}회`
                  : undefined
              }
              onKeyDown={(event) => {
                if (!interactive || !cell.subject || !onSelectSubject) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectSubject(cell.subject, cell.domainIndex)
                }
              }}
            >
              {cell.kind !== 'landmark' && (
                <path
                  d={tilePath()}
                  fill={
                    cell.kind === 'sign'
                      ? shade(color, 0.62)
                      : isSelected
                        ? shade(color, 0.44)
                        : terrain.base
                  }
                  stroke={isSelected ? color : terrain.edge}
                  strokeWidth={isSelected ? 2.4 : 0.8}
                />
              )}

              {cell.kind === 'landmark' && <Landmark progress={progress} />}

              {cell.kind === 'sign' && (
                <g>
                  <IsoBox w={TW * 0.26} h={13} color={color} />
                  <path d="M 0 -13 L 0 -26" stroke={shade(color, -0.3)} strokeWidth={2.2} />
                  {!compact && cell.domainTitle && (
                    <text
                      y={-31}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={800}
                      fill="#2b2823"
                      stroke="rgba(255,255,255,.9)"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {cell.domainTitle.length > 7
                        ? `${cell.domainTitle.slice(0, 6)}…`
                        : cell.domainTitle}
                    </text>
                  )}
                </g>
              )}

              {cell.kind === 'plot' && cell.subject && (
                <Building
                  stage={stageOf(cell.subject.progress)}
                  color={color}
                  shape={SHAPES[(cell.gx * 3 + cell.gy) % SHAPES.length]}
                />
              )}

              {cell.kind === 'empty' && (
                <path d={tilePath(TW * 0.5, TH * 0.5)} fill="rgba(255,255,255,.3)" />
              )}
            </g>
          )
        })}
      </svg>

      {!compact && hover && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
          <span
            className="max-w-full truncate rounded-full px-3.5 py-1.5 text-[12.5px] font-bold"
            style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)' }}
          >
            {cells.find((c) => c.key === hover)?.subject?.title ?? ''}
          </span>
        </div>
      )}
    </div>
  )
}
