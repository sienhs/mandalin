import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { type Group } from 'three'
import { PALETTE, resolveColor } from './palette'
import {
  BUILDING_CONFIGS,
  DETAIL_KINDS,
  PL,
  type Part,
  type Stage,
  type ThemeKey,
  THEMES,
} from './catalog'
import { PREMIUM_CONFIGS } from './premium'

/** 기존 15종 + 프리미엄 테마 건물 병합 카탈로그. */
export const ALL_CONFIGS = { ...BUILDING_CONFIGS, ...PREMIUM_CONFIGS }
/** 렌더 가능한 모든 건물 key (기존 + 프리미엄). */
export type AnyBuildingKey = keyof typeof ALL_CONFIGS

/**
 * 데이터 드리븐 건물 렌더러.
 * catalog.ts의 config(부품 배열)를 해석해 로우폴리 건물을 그린다.
 * 새 건물은 catalog에 config만 추가하면 됨 — 이 파일은 부품 종류가 늘 때만 수정.
 */

// ─────────── 공통 부품 컴포넌트 ───────────

/** 4면 균일 격자 창문(인스턴싱, 건물당 1드로우콜). */
function WindowGrid({
  w, d = w, yBase, yTop, color, glow = 0.32, cx = 0, cz = 0,
}: {
  w: number; d?: number; yBase: number; yTop: number; color: string; glow?: number; cx?: number; cz?: number
}) {
  const sx = 0.08
  const sy = 0.096
  const inset = 0.006
  type T = { position: [number, number, number]; rotation: [number, number, number] }
  const items: T[] = []
  const faces: { len: number; axis: 'z' | 'x'; sign: 1 | -1; off: number }[] = [
    { len: w, axis: 'z', sign: 1, off: d / 2 },
    { len: w, axis: 'z', sign: -1, off: d / 2 },
    { len: d, axis: 'x', sign: 1, off: w / 2 },
    { len: d, axis: 'x', sign: -1, off: w / 2 },
  ]
  for (const f of faces) {
    const cols = Math.max(1, Math.floor((f.len * 0.82) / sx))
    const rows = Math.max(1, Math.floor((yTop - yBase) / sy))
    const startAlong = -((cols - 1) * sx) / 2
    const startY = yBase + ((yTop - yBase) - (rows - 1) * sy) / 2
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const along = startAlong + c * sx
        const y = startY + r * sy
        if (f.axis === 'z') items.push({ position: [cx + along, y, cz + f.sign * (f.off + inset)], rotation: [0, f.sign > 0 ? 0 : Math.PI, 0] })
        else items.push({ position: [cx + f.sign * (f.off + inset), y, cz + along], rotation: [0, f.sign > 0 ? Math.PI / 2 : -Math.PI / 2, 0] })
      }
    }
  }
  const c = resolveColor(color)
  return (
    <Instances limit={items.length} range={items.length}>
      <boxGeometry args={[0.052, 0.06, 0.016]} />
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={glow} roughness={0.15} metalness={0.5} />
      {items.map((it, i) => (
        <Instance key={i} position={it.position} rotation={it.rotation} />
      ))}
    </Instances>
  )
}

function PitchedRoof({ w, d = w, y, height, color }: { w: number; d?: number; y: number; height: number; color: string }) {
  const c = resolveColor(color)
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.015, 0]} castShadow><boxGeometry args={[w * 1.12, 0.03, d * 1.12]} /><meshStandardMaterial color={c.clone().multiplyScalar(0.8)} roughness={0.9} /></mesh>
      <mesh position={[0, height / 2 + 0.03, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[Math.max(w, d) * 0.82, height, 4]} /><meshStandardMaterial color={c} roughness={0.9} flatShading /></mesh>
    </group>
  )
}

function Parapet({ w, d = w, y, color }: { w: number; d?: number; y: number; color: string }) {
  const c = resolveColor(color)
  const t = 0.03, ph = 0.07
  return (
    <group position={[0, y + ph / 2, 0]}>
      <mesh position={[0, 0, d / 2]}><boxGeometry args={[w + t, ph, t]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>
      <mesh position={[0, 0, -d / 2]}><boxGeometry args={[w + t, ph, t]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>
      <mesh position={[w / 2, 0, 0]}><boxGeometry args={[t, ph, d + t]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>
      <mesh position={[-w / 2, 0, 0]}><boxGeometry args={[t, ph, d + t]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>
    </group>
  )
}

function RooftopUnits({ w, y }: { w: number; y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[-w * 0.18, 0.05, w * 0.1]} castShadow><boxGeometry args={[w * 0.3, 0.1, w * 0.25]} /><meshStandardMaterial color={resolveColor('roofDark')} roughness={0.8} /></mesh>
      <mesh position={[w * 0.2, 0.07, -w * 0.12]} castShadow><boxGeometry args={[w * 0.18, 0.14, w * 0.18]} /><meshStandardMaterial color={resolveColor('concrete')} roughness={0.8} /></mesh>
      <mesh position={[w * 0.05, 0.06, w * 0.22]} castShadow><cylinderGeometry args={[0.03, 0.03, 0.12, 8]} /><meshStandardMaterial color={resolveColor('roofDark')} /></mesh>
    </group>
  )
}

function CrossPart({ y, z = 0, color, s = 1 }: { y: number; z?: number; color: string; s?: number }) {
  const c = resolveColor(color)
  return (
    <group position={[0, y, z]}>
      <mesh><boxGeometry args={[0.17 * s, 0.055 * s, 0.03]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.45} /></mesh>
      <mesh><boxGeometry args={[0.055 * s, 0.17 * s, 0.03]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.45} /></mesh>
    </group>
  )
}

function AntennaPart({ y, h = 0.34 }: { y: number; h?: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.012, 0.012, h, 6]} /><meshStandardMaterial color={resolveColor('concrete')} metalness={0.5} /></mesh>
      <mesh position={[0, h, 0]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color={resolveColor('beaconRed')} emissive={resolveColor('beaconRed')} emissiveIntensity={0.7} /></mesh>
    </group>
  )
}

function Storefront({ w, d = w, faceH, awning, sign }: { w: number; d?: number; faceH: number; awning: string; sign: string }) {
  const z = d / 2
  return (
    <group>
      <mesh position={[0, faceH * 0.42, z + 0.006]}><planeGeometry args={[w * 0.82, faceH * 0.62]} /><meshStandardMaterial color={resolveColor('glass')} emissive={resolveColor('glass')} emissiveIntensity={0.28} roughness={0.15} metalness={0.4} /></mesh>
      <mesh position={[w * 0.26, faceH * 0.28, z + 0.012]}><planeGeometry args={[w * 0.2, faceH * 0.5]} /><meshStandardMaterial color={resolveColor('roofDark')} roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, faceH * 0.72, z + w * 0.05]} rotation={[-Math.PI / 8, 0, 0]} castShadow><boxGeometry args={[w * 0.98, 0.02, w * 0.24]} /><meshStandardMaterial color={resolveColor(awning)} roughness={0.8} /></mesh>
      <mesh position={[0, faceH * 0.92, z + 0.02]}><planeGeometry args={[w * 0.9, faceH * 0.16]} /><meshStandardMaterial color={resolveColor(sign)} emissive={resolveColor(sign)} emissiveIntensity={0.3} /></mesh>
    </group>
  )
}

function ColumnsPart({ w, d = w, y, h, count = 4, color }: { w: number; d?: number; y: number; h: number; count?: number; color: string }) {
  const c = resolveColor(color)
  const xs = Array.from({ length: count }, (_, i) => (count === 1 ? 0 : (i / (count - 1) - 0.5) * w * 0.76))
  return (
    <group>
      {xs.map((x, i) => (
        <mesh key={i} position={[x, y + h / 2, d / 2 + 0.03]} castShadow><cylinderGeometry args={[0.022, 0.022, h, 10]} /><meshStandardMaterial color={c} roughness={0.7} /></mesh>
      ))}
      <mesh position={[0, y + h + 0.025, d / 2 + 0.03]} castShadow><boxGeometry args={[w * 0.9, 0.05, 0.06]} /><meshStandardMaterial color={c} roughness={0.7} /></mesh>
    </group>
  )
}

function BalconiesPart({ w, d = w, y0, y1, floors, color }: { w: number; d?: number; y0: number; y1: number; floors: number; color: string }) {
  const c = resolveColor(color)
  return (
    <group>
      {Array.from({ length: floors }).map((_, i) => {
        const y = floors === 1 ? y0 : y0 + (y1 - y0) * (i / (floors - 1))
        return <mesh key={i} position={[0, y, d / 2 + 0.03]} castShadow><boxGeometry args={[w * 0.92, 0.02, 0.06]} /><meshStandardMaterial color={c} roughness={0.8} /></mesh>
      })}
    </group>
  )
}

function ParasolPart({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.006, 0.006, 0.28, 6]} /><meshStandardMaterial color={resolveColor('wood')} /></mesh>
      <mesh position={[0, 0.28, 0]}><coneGeometry args={[0.14, 0.08, 8]} /><meshStandardMaterial color={resolveColor(color)} roughness={0.7} flatShading /></mesh>
    </group>
  )
}

function BladesPart({ y }: { y: number }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.5
  })
  return (
    <group ref={ref} position={[0, y, 0.2]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
          <mesh position={[0, 0.28, 0]} castShadow><boxGeometry args={[0.05, 0.5, 0.02]} /><meshStandardMaterial color={resolveColor('wood')} roughness={0.7} /></mesh>
          <mesh position={[0.05, 0.28, 0.012]}><planeGeometry args={[0.07, 0.44]} /><meshStandardMaterial color={resolveColor('blade')} roughness={0.6} side={2} /></mesh>
        </group>
      ))}
      <mesh><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color={resolveColor('roofDark')} /></mesh>
    </group>
  )
}

function ClockPart({ w, y, color }: { w: number; y: number; color: string }) {
  const c = resolveColor(color)
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.sin((i * Math.PI) / 2) * (w / 2 + 0.006), y, Math.cos((i * Math.PI) / 2) * (w / 2 + 0.006)]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <circleGeometry args={[w * 0.3, 16]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/** 나무: stage2=간략(줄기+한덩이), stage3=캐노피 6덩이+열매. */
function TreePart({ stage }: { stage: Stage }) {
  if (stage === 2) {
    return (
      <group>
        <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.13, 0.16, 0.9, 7]} /><meshStandardMaterial color={resolveColor('bark')} roughness={0.95} flatShading /></mesh>
        <mesh position={[0, 1.4, 0]} castShadow><icosahedronGeometry args={[0.6, 1]} /><meshStandardMaterial color={resolveColor('foliage')} roughness={1} flatShading /></mesh>
      </group>
    )
  }
  const blobs: [number, number, number, number][] = [
    [0, 1.6, 0, 0.58], [0.32, 1.43, 0.1, 0.4], [-0.28, 1.48, -0.16, 0.42],
    [0.08, 1.46, -0.32, 0.38], [-0.1, 1.52, 0.3, 0.38], [0.04, 1.88, 0.02, 0.38],
  ]
  const fruit: [number, number, number][] = [
    [0.5, 1.7, 0.2], [-0.45, 1.78, -0.1], [0.2, 1.9, 0.5], [-0.28, 2.1, 0.2], [0.42, 1.58, -0.42], [0, 2.15, -0.2],
  ]
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.13, 0.16, 0.9, 7]} /><meshStandardMaterial color={resolveColor('bark')} roughness={0.95} flatShading /></mesh>
      {blobs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={i % 2 ? resolveColor('foliage') : resolveColor('bush')} roughness={1} flatShading /></mesh>
      ))}
      {fruit.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color={resolveColor('accent')} roughness={0.5} /></mesh>
      ))}
    </group>
  )
}

// ─────────── 부품 → JSX 디스패치 ───────────

function renderPart(p: Part, stage: Stage, i: number) {
  if (stage === 2 && DETAIL_KINDS.has(p.k)) return null
  switch (p.k) {
    case 'plinth': {
      const c = resolveColor(p.color)
      return <mesh key={i} position={[0, PL / 2, 0]} castShadow receiveShadow><boxGeometry args={[p.w * 1.14, PL, (p.d ?? p.w) * 1.14]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
    }
    case 'box': {
      const c = resolveColor(p.color)
      const y = p.y ?? 0
      return (
        <group key={i} position={[p.x ?? 0, 0, p.z ?? 0]}>
          <mesh position={[0, y + p.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[p.w, p.h, p.d ?? p.w]} />
            <meshStandardMaterial color={c} roughness={p.rough ?? 0.6} metalness={p.metal ?? 0.1} flatShading emissive={c} emissiveIntensity={p.emissive ? 0.5 : 0} />
          </mesh>
          {stage === 3 && p.windows && (
            <WindowGrid w={p.w} d={p.d ?? p.w} yBase={y + p.h * p.windows.from} yTop={y + p.h * p.windows.to} color={p.windows.color} glow={p.windows.glow} />
          )}
        </group>
      )
    }
    case 'cyl': {
      const c = resolveColor(p.color)
      const y = p.y ?? 0
      return <mesh key={i} position={[0, y + p.h / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[p.rt, p.rb, p.h, p.seg ?? 10]} /><meshStandardMaterial color={c} roughness={0.85} flatShading /></mesh>
    }
    case 'roof': {
      const height = p.height ?? 0.2
      if (p.type === 'pyramid') return <PitchedRoof key={i} w={p.w} d={p.d ?? p.w} y={p.y} height={height} color={p.color} />
      if (p.type === 'cone') return <mesh key={i} position={[0, p.y + height / 2, 0]} castShadow><coneGeometry args={[p.w * 0.6, height, 10]} /><meshStandardMaterial color={resolveColor(p.color)} roughness={0.9} flatShading /></mesh>
      if (p.type === 'dome') return <mesh key={i} position={[0, p.y, 0]} castShadow><sphereGeometry args={[p.w * 0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={resolveColor(p.color)} roughness={0.4} metalness={0.3} /></mesh>
      return <mesh key={i} position={[0, p.y + 0.06, 0]} castShadow><cylinderGeometry args={[p.w * 0.62, p.w * 0.5, 0.12, 10]} /><meshStandardMaterial color={resolveColor(p.color)} roughness={0.9} flatShading /></mesh>
    }
    case 'parapet':
      return <Parapet key={i} w={p.w} d={p.d ?? p.w} y={p.y} color={p.color} />
    case 'panel': {
      const c = resolveColor(p.color)
      return <mesh key={i} position={p.pos} rotation={[0, p.rotY ?? 0, 0]}><planeGeometry args={[p.w, p.h]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={p.glow ?? 0} roughness={0.5} metalness={p.glow ? 0.3 : 0} side={2} /></mesh>
    }
    case 'rooftopUnits':
      return <RooftopUnits key={i} w={p.w} y={p.y} />
    case 'cross':
      return <CrossPart key={i} y={p.y} z={p.z} color={p.color} s={p.s} />
    case 'antenna':
      return <AntennaPart key={i} y={p.y} h={p.h} />
    case 'storefront':
      return <Storefront key={i} w={p.w} d={p.d ?? p.w} faceH={p.faceH} awning={p.awning} sign={p.sign} />
    case 'columns':
      return <ColumnsPart key={i} w={p.w} d={p.d ?? p.w} y={p.y} h={p.h} count={p.count} color={p.color} />
    case 'balconies':
      return <BalconiesPart key={i} w={p.w} d={p.d ?? p.w} y0={p.y0} y1={p.y1} floors={p.floors} color={p.color} />
    case 'parasol':
      return <ParasolPart key={i} pos={p.pos} color={p.color} />
    case 'blades':
      return <BladesPart key={i} y={p.y} />
    case 'clock':
      return <ClockPart key={i} w={p.w} y={p.y} color={p.color} />
    case 'tree':
      return <TreePart key={i} stage={stage} />
    default:
      return null
  }
}

// ─────────── 단계 렌더 ───────────

/** 1단계: 테마로 통일된 균일 shell (일관화). */
function Stage1({ theme }: { theme: ThemeKey }) {
  const c = resolveColor(THEMES[theme].color)
  const cap = c.clone().multiplyScalar(0.78)
  return (
    <group>
      <mesh position={[0, PL / 2, 0]} receiveShadow><boxGeometry args={[0.34 * 1.14, PL, 0.34 * 1.14]} /><meshStandardMaterial color={cap} roughness={0.95} /></mesh>
      <mesh position={[0, PL + 0.24, 0]} castShadow receiveShadow><boxGeometry args={[0.32, 0.48, 0.32]} /><meshStandardMaterial color={c} roughness={0.85} flatShading /></mesh>
      <PitchedRoof w={0.32} y={PL + 0.48} height={0.16} color={theme === 'stone' ? 'concrete' : 'roof'} />
    </group>
  )
}

/** 단계별 디스패치: 1=일관화 shell, 2=형태(디테일 생략), 3=완성. */
export function StageBuilding({ k, stage, theme }: { k: AnyBuildingKey; stage: Stage; theme: ThemeKey }) {
  if (stage === 1) return <Stage1 theme={theme} />
  return <group>{ALL_CONFIGS[k].parts.map((p, i) => renderPart(p, stage, i))}</group>
}

// ─────────── 블록 장식 ───────────

export function Bush({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      {[[0, 0.16, 0, 0.2], [0.16, 0.13, 0.05, 0.16], [-0.14, 0.12, -0.06, 0.14]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={PALETTE.bush} roughness={1} flatShading /></mesh>
      ))}
    </group>
  )
}

export function FlowerBed() {
  const flowers = [PALETTE.flowerRed, PALETTE.flowerOrange, PALETTE.flowerPurple, PALETTE.accent]
  const cells: [number, number][] = []
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) cells.push([a * 0.12, b * 0.12])
  return (
    <group>
      <mesh position={[0, 0.03, 0]} receiveShadow><boxGeometry args={[0.5, 0.06, 0.5]} /><meshStandardMaterial color={PALETTE.soil} roughness={1} /></mesh>
      {cells.map(([x, z], i) => (
        <group key={i} position={[x, 0.06, z]}>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.008, 0.008, 0.16, 5]} /><meshStandardMaterial color={PALETTE.foliage} /></mesh>
          <mesh position={[0, 0.18, 0]}><icosahedronGeometry args={[0.05, 0]} /><meshStandardMaterial color={flowers[i % flowers.length]} roughness={0.6} /></mesh>
        </group>
      ))}
    </group>
  )
}
