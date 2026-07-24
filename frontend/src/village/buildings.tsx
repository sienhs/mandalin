import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { Color, type Group } from 'three'
import { PALETTE } from './palette'

/**
 * 레퍼런스(ref/vilage.obj, city.obj) 어휘 기반 로우폴리 건물 라이브러리 v2.
 * 모든 건물은 "ref 단위"(footprint≈0.3~0.46)로 원점 기준 모델링, 배치 시 스케일업.
 *
 * v2 개선점:
 *  - 공통 디테일: 주춧돌(plinth) · 격자 창문(인스턴싱) · 파라펫 · 옥상 설비 · 처마 · 입면 유리
 *  - 낮은 건물 다층 재설계(오두막→2층 타운하우스, 편의점/카페/약국→다층 등)
 *  - 고층 재설계(오피스/아파트/병원/마천루 층수·높이 상향)
 */

const PLINTH_H = 0.07

// ─────────────────────────── 공통 헬퍼 ───────────────────────────

/** 주춧돌 — 몸통보다 살짝 넓은 받침. */
function Plinth({ w, d = w, color = PALETTE.concrete }: { w: number; d?: number; color?: Color }) {
  return (
    <mesh position={[0, PLINTH_H / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[w * 1.14, PLINTH_H, d * 1.14]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

/** 4면 균일 격자 창문(인스턴싱, 건물당 1드로우콜). */
function WindowGrid({
  w,
  d = w,
  yBase,
  yTop,
  color = PALETTE.glass,
  glow = 0.32,
}: {
  w: number
  d?: number
  yBase: number
  yTop: number
  color?: Color
  glow?: number
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
        if (f.axis === 'z') {
          items.push({
            position: [along, y, f.sign * (f.off + inset)],
            rotation: [0, f.sign > 0 ? 0 : Math.PI, 0],
          })
        } else {
          items.push({
            position: [f.sign * (f.off + inset), y, along],
            rotation: [0, f.sign > 0 ? Math.PI / 2 : -Math.PI / 2, 0],
          })
        }
      }
    }
  }
  return (
    <Instances limit={items.length} range={items.length}>
      <boxGeometry args={[0.052, 0.06, 0.016]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.15} metalness={0.5} />
      {items.map((it, i) => (
        <Instance key={i} position={it.position} rotation={it.rotation} />
      ))}
    </Instances>
  )
}

/** 몸통 + 격자창 입면. */
function Facade({
  w,
  h,
  d = w,
  color,
  winColor = PALETTE.glass,
  glow = 0.32,
  rough = 0.55,
  metal = 0.12,
}: {
  w: number
  h: number
  d?: number
  color: Color
  winColor?: Color
  glow?: number
  rough?: number
  metal?: number
}) {
  return (
    <>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={rough} metalness={metal} flatShading />
      </mesh>
      <WindowGrid w={w} d={d} yBase={h * 0.12} yTop={h * 0.9} color={winColor} glow={glow} />
    </>
  )
}

/** 평지붕 난간(파라펫) 4변. */
function Parapet({ w, d = w, y, color = PALETTE.concrete }: { w: number; d?: number; y: number; color?: Color }) {
  const t = 0.03
  const ph = 0.07
  return (
    <group position={[0, y + ph / 2, 0]}>
      <mesh position={[0, 0, d / 2]}><boxGeometry args={[w + t, ph, t]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
      <mesh position={[0, 0, -d / 2]}><boxGeometry args={[w + t, ph, t]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
      <mesh position={[w / 2, 0, 0]}><boxGeometry args={[t, ph, d + t]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
      <mesh position={[-w / 2, 0, 0]}><boxGeometry args={[t, ph, d + t]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    </group>
  )
}

/** 옥상 설비(공조기 박스 + 환기구). */
function RooftopUnits({ w, y }: { w: number; y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[-w * 0.18, 0.05, w * 0.1]} castShadow>
        <boxGeometry args={[w * 0.3, 0.1, w * 0.25]} />
        <meshStandardMaterial color={PALETTE.roofDark} roughness={0.8} />
      </mesh>
      <mesh position={[w * 0.2, 0.07, -w * 0.12]} castShadow>
        <boxGeometry args={[w * 0.18, 0.14, w * 0.18]} />
        <meshStandardMaterial color={PALETTE.concrete} roughness={0.8} />
      </mesh>
      <mesh position={[w * 0.05, 0.06, w * 0.22]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
        <meshStandardMaterial color={PALETTE.roofDark} />
      </mesh>
    </group>
  )
}

/** 박공(피라미드) 지붕 + 처마. */
function PitchedRoof({ w, d = w, y, height, color }: { w: number; d?: number; y: number; height: number; color: Color }) {
  return (
    <group position={[0, y, 0]}>
      {/* 처마 슬래브 */}
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[w * 1.12, 0.03, d * 1.12]} />
        <meshStandardMaterial color={color.clone().multiplyScalar(0.8)} roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2 + 0.03, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(w, d) * 0.82, height, 4]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

/** 1층 상점 정면(대형 유리 + 문 + 차양 + 간판). */
function Storefront({ w, d = w, faceH, awningColor, signColor }: { w: number; d?: number; faceH: number; awningColor: Color; signColor: Color }) {
  const z = d / 2
  return (
    <group>
      <mesh position={[0, faceH * 0.42, z + 0.006]}>
        <planeGeometry args={[w * 0.82, faceH * 0.62]} />
        <meshStandardMaterial color={PALETTE.glass} emissive={PALETTE.glass} emissiveIntensity={0.28} roughness={0.15} metalness={0.4} />
      </mesh>
      {/* 문 */}
      <mesh position={[w * 0.26, faceH * 0.28, z + 0.012]}>
        <planeGeometry args={[w * 0.2, faceH * 0.5]} />
        <meshStandardMaterial color={PALETTE.roofDark} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* 차양 */}
      <mesh position={[0, faceH * 0.74, z + w * 0.16]} rotation={[-Math.PI / 5, 0, 0]} castShadow>
        <boxGeometry args={[w * 1.04, 0.02, w * 0.36]} />
        <meshStandardMaterial color={awningColor} roughness={0.8} />
      </mesh>
      {/* 간판 */}
      <mesh position={[0, faceH * 0.92, z + 0.02]}>
        <planeGeometry args={[w * 0.9, faceH * 0.16]} />
        <meshStandardMaterial color={signColor} emissive={signColor} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/** 십자 간판. */
function CrossSign({ y, z = 0, color }: { y: number; z?: number; color: Color }) {
  return (
    <group position={[0, y, z]}>
      <mesh><boxGeometry args={[0.17, 0.055, 0.03]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} /></mesh>
      <mesh><boxGeometry args={[0.055, 0.17, 0.03]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} /></mesh>
    </group>
  )
}

/** 옥상 안테나 + 항공장애등. */
function Antenna({ y, h = 0.34 }: { y: number; h?: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.012, 0.012, h, 6]} /><meshStandardMaterial color={PALETTE.concrete} metalness={0.5} /></mesh>
      <mesh position={[0, h, 0]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color={PALETTE.beaconRed} emissive={PALETTE.beaconRed} emissiveIntensity={0.7} /></mesh>
    </group>
  )
}

// ─────────────────────────── 마을풍 (다층 재설계) ───────────────────────────

/** 타운하우스(2층) — 크림/테라코타/블루 벽 + 박공지붕 + 굴뚝 + 문. */
export function Cottage({ wall = PALETTE.wallCream }: { wall?: Color }) {
  const w = 0.4
  const d = 0.34
  const h = 0.72
  return (
    <group>
      <Plinth w={w} d={d} color={PALETTE.path} />
      <group position={[0, PLINTH_H, 0]}>
        <Facade w={w} h={h} d={d} color={wall} winColor={PALETTE.glassWarm} glow={0.28} rough={0.85} metal={0} />
        {/* 문 */}
        <mesh position={[-w * 0.18, PLINTH_H + h * 0.16, d / 2 + 0.006]}>
          <planeGeometry args={[w * 0.16, h * 0.32]} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.9} />
        </mesh>
        <PitchedRoof w={w} d={d} y={h} height={0.26} color={PALETTE.roof} />
        {/* 굴뚝 */}
        <mesh position={[w * 0.28, h + 0.2, -d * 0.2]} castShadow>
          <boxGeometry args={[0.07, 0.22, 0.07]} />
          <meshStandardMaterial color={PALETTE.wallTerracotta} roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

/** 시계탑 — 석조 베이스 + 좁고 높은 몸통 + 시계판 + 박공지붕 + 첨탑. */
export function ClockTower() {
  const w = 0.26
  const h = 1.15
  return (
    <group>
      <Plinth w={w} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, w]} />
          <meshStandardMaterial color={PALETTE.wallBlue} roughness={0.8} flatShading />
        </mesh>
        {/* 아치형 좁은 창 */}
        <WindowGrid w={w} yBase={h * 0.15} yTop={h * 0.6} color={PALETTE.glassWarm} glow={0.3} />
        {/* 시계판 (4면) */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.sin((i * Math.PI) / 2) * (w / 2 + 0.006), h * 0.82, Math.cos((i * Math.PI) / 2) * (w / 2 + 0.006)]} rotation={[0, (i * Math.PI) / 2, 0]}>
            <circleGeometry args={[w * 0.3, 16]} />
            <meshStandardMaterial color={PALETTE.wallCream} emissive={PALETTE.wallCream} emissiveIntensity={0.25} />
          </mesh>
        ))}
        <PitchedRoof w={w} y={h} height={0.3} color={PALETTE.roofDark} />
        <mesh position={[0, h + 0.42, 0]}><cylinderGeometry args={[0.01, 0.01, 0.16, 6]} /><meshStandardMaterial color={PALETTE.accent} emissive={PALETTE.accent} emissiveIntensity={0.4} /></mesh>
      </group>
    </group>
  )
}

/** 풍차 — 테이퍼 몸통 + 갤러리 발코니 + 캡 + 회전 날개. */
export function Windmill() {
  const blades = useRef<Group>(null)
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.5
  })
  const w = 0.3
  const h = 0.95
  return (
    <group>
      <Plinth w={w} color={PALETTE.path} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.55, w * 0.72, h, 10]} />
          <meshStandardMaterial color={PALETTE.wallCream} roughness={0.85} flatShading />
        </mesh>
        {/* 갤러리 발코니 링 */}
        <mesh position={[0, h * 0.62, 0]} castShadow>
          <cylinderGeometry args={[w * 0.66, w * 0.66, 0.03, 12]} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.9} />
        </mesh>
        {/* 창 몇 개 */}
        {[0.3, 0.55, 0.8].map((fy, i) => (
          <mesh key={i} position={[0, h * fy, w * 0.56]}>
            <planeGeometry args={[0.06, 0.08]} />
            <meshStandardMaterial color={PALETTE.glassWarm} emissive={PALETTE.glassWarm} emissiveIntensity={0.3} />
          </mesh>
        ))}
        {/* 캡 */}
        <mesh position={[0, h + 0.08, 0]} castShadow>
          <coneGeometry args={[w * 0.6, 0.2, 10]} />
          <meshStandardMaterial color={PALETTE.roofDark} roughness={0.9} flatShading />
        </mesh>
        {/* 날개 */}
        <group ref={blades} position={[0, h * 0.92, w * 0.6]}>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <mesh position={[0, 0.28, 0]} castShadow>
                <boxGeometry args={[0.05, 0.5, 0.02]} />
                <meshStandardMaterial color={PALETTE.wood} roughness={0.7} />
              </mesh>
              <mesh position={[0.05, 0.28, 0.012]}>
                <planeGeometry args={[0.07, 0.44]} />
                <meshStandardMaterial color={PALETTE.blade} roughness={0.6} side={2} />
              </mesh>
            </group>
          ))}
          <mesh><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color={PALETTE.roofDark} /></mesh>
        </group>
      </group>
    </group>
  )
}

/** 나무 — 줄기 + 캐노피 6덩이 + 오렌지 열매. */
export function Tree({ big = false }: { big?: boolean }) {
  const s = big ? 1.35 : 1
  const blobs: [number, number, number, number][] = [
    [0, 1.6, 0, 0.58], [0.32, 1.43, 0.1, 0.4], [-0.28, 1.48, -0.16, 0.42],
    [0.08, 1.46, -0.32, 0.38], [-0.1, 1.52, 0.3, 0.38], [0.04, 1.88, 0.02, 0.38],
  ]
  const fruit: [number, number, number][] = [
    [0.5, 1.7, 0.2], [-0.45, 1.78, -0.1], [0.2, 1.9, 0.5], [-0.28, 2.1, 0.2], [0.42, 1.58, -0.42], [0, 2.15, -0.2],
  ]
  return (
    <group scale={s}>
      <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.13, 0.16, 0.9, 7]} /><meshStandardMaterial color={PALETTE.bark} roughness={0.95} flatShading /></mesh>
      {blobs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={i % 2 ? PALETTE.foliage : PALETTE.bush} roughness={1} flatShading /></mesh>
      ))}
      {fruit.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color={PALETTE.accent} roughness={0.5} /></mesh>
      ))}
    </group>
  )
}

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

// ─────────────────────────── 도시풍 (고층 재설계) ───────────────────────────

/** 병원 — 고층 백색동 + 저층동 + 정면 대형 적십자 + 옥상 적십자·설비. */
export function Hospital() {
  const w = 0.4
  const d = 0.34
  const h = 1.35
  const white = new Color('#eef1f3')
  return (
    <group>
      <Plinth w={w} d={d} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <Facade w={w} h={h} d={d} color={white} winColor={PALETTE.glass} glow={0.22} rough={0.5} metal={0.1} />
        {/* 저층 부속동 */}
        <mesh position={[w * 0.62, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.5, 0.44, d * 0.9]} />
          <meshStandardMaterial color={white} roughness={0.5} flatShading />
        </mesh>
        {/* 입구 캐노피 */}
        <mesh position={[0, 0.16, d / 2 + 0.08]} castShadow><boxGeometry args={[w * 0.5, 0.03, 0.16]} /><meshStandardMaterial color={PALETTE.beaconRed} /></mesh>
        {/* 정면 적십자 */}
        <mesh position={[0, h * 0.7, d / 2 + 0.008]}><planeGeometry args={[0.1, 0.03]} /><meshStandardMaterial color={PALETTE.beaconRed} emissive={PALETTE.beaconRed} emissiveIntensity={0.4} /></mesh>
        <mesh position={[0, h * 0.7, d / 2 + 0.008]}><planeGeometry args={[0.03, 0.1]} /><meshStandardMaterial color={PALETTE.beaconRed} emissive={PALETTE.beaconRed} emissiveIntensity={0.4} /></mesh>
        <Parapet w={w} d={d} y={h} color={white} />
        <RooftopUnits w={w} y={h} />
        <CrossSign y={h + 0.14} color={PALETTE.beaconRed} />
      </group>
    </group>
  )
}

/** 오피스 — 유리 커튼월 고층 + 세트백 top + 안테나. */
export function Office() {
  const w = 0.34
  const h = 1.9
  return (
    <group>
      <Plinth w={w} color={PALETTE.roofDark} />
      <group position={[0, PLINTH_H, 0]}>
        <Facade w={w} h={h * 0.82} color={PALETTE.wallBlue.clone().lerp(PALETTE.concrete, 0.4)} winColor={PALETTE.glass} glow={0.4} rough={0.25} metal={0.55} />
        {/* 세트백 상부 */}
        <group position={[0, h * 0.82, 0]}>
          <Facade w={w * 0.72} h={h * 0.18} color={PALETTE.concrete} winColor={PALETTE.glass} glow={0.4} rough={0.25} metal={0.55} />
          <Parapet w={w * 0.72} y={h * 0.18} color={PALETTE.roofDark} />
          <RooftopUnits w={w * 0.72} y={h * 0.18} />
          <Antenna y={h * 0.18} h={0.4} />
        </group>
      </group>
    </group>
  )
}

/** 아파트 — 고층 주거동 + 층별 발코니 + 파라펫. */
export function Apartment() {
  const w = 0.4
  const d = 0.32
  const h = 1.55
  const floors = 7
  return (
    <group>
      <Plinth w={w} d={d} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <Facade w={w} h={h} d={d} color={PALETTE.wallCream} winColor={PALETTE.glassWarm} glow={0.26} rough={0.7} metal={0.05} />
        {/* 발코니 슬래브 (정면) */}
        {Array.from({ length: floors }).map((_, i) => (
          <mesh key={i} position={[0, h * 0.16 + (i * h * 0.72) / floors, d / 2 + 0.03]} castShadow>
            <boxGeometry args={[w * 0.92, 0.02, 0.06]} />
            <meshStandardMaterial color={PALETTE.concrete} roughness={0.8} />
          </mesh>
        ))}
        <Parapet w={w} d={d} y={h} color={PALETTE.wallCream} />
        <RooftopUnits w={w} y={h} />
      </group>
    </group>
  )
}

/** 약국 — 중층 + 초록 십자 간판 + 1층 유리. */
export function Pharmacy() {
  const w = 0.32
  const h = 1.0
  return (
    <group>
      <Plinth w={w} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <Facade w={w} h={h} color={PALETTE.wallCream} winColor={PALETTE.glassWarm} glow={0.26} rough={0.7} />
        <mesh position={[0, h * 0.18, w / 2 + 0.006]}><planeGeometry args={[w * 0.8, h * 0.28]} /><meshStandardMaterial color={PALETTE.glass} emissive={PALETTE.glass} emissiveIntensity={0.28} metalness={0.3} roughness={0.2} /></mesh>
        <Parapet w={w} y={h} color={PALETTE.wallCream} />
        <CrossSign y={h * 0.82} z={w / 2 + 0.02} color={PALETTE.bush} />
      </group>
    </group>
  )
}

/** 편의점 — 2층 + 대형 스토어프론트 + 어닝 + 간판. */
export function CornerStore() {
  const w = 0.4
  const h = 0.78
  return (
    <group>
      <Plinth w={w} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, w]} /><meshStandardMaterial color={PALETTE.wallCream} roughness={0.6} flatShading /></mesh>
        {/* 2층 창 */}
        <WindowGrid w={w} yBase={h * 0.55} yTop={h * 0.9} color={PALETTE.glassWarm} glow={0.28} />
        <Storefront w={w} faceH={h * 0.5} awningColor={PALETTE.accent} signColor={PALETTE.wallBlue} />
        <Parapet w={w} y={h} color={PALETTE.wallCream} />
      </group>
    </group>
  )
}

/** 카페 — 2층 + 스토어프론트 + 어닝 + 옥상 테라스 난간 + 굴뚝. */
export function Cafe() {
  const w = 0.34
  const h = 0.62
  return (
    <group>
      <Plinth w={w} color={PALETTE.path} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, w]} /><meshStandardMaterial color={PALETTE.wallTerracotta} roughness={0.75} flatShading /></mesh>
        <WindowGrid w={w} yBase={h * 0.58} yTop={h * 0.9} color={PALETTE.glassWarm} glow={0.28} />
        <Storefront w={w} faceH={h * 0.52} awningColor={PALETTE.bush} signColor={PALETTE.wallCream} />
        <Parapet w={w} y={h} color={PALETTE.wallTerracotta} />
        {/* 파라솔 */}
        <mesh position={[w * 0.28, h + 0.14, w * 0.28]}><cylinderGeometry args={[0.006, 0.006, 0.28, 6]} /><meshStandardMaterial color={PALETTE.wood} /></mesh>
        <mesh position={[w * 0.28, h + 0.28, w * 0.28]}><coneGeometry args={[0.14, 0.08, 8]} /><meshStandardMaterial color={PALETTE.accent} roughness={0.7} flatShading /></mesh>
      </group>
    </group>
  )
}

/** 마트 — 넓고 큰 매장 + 대형 스토어프론트 + 간판 + 옥상 설비. */
export function Mart() {
  const w = 0.46
  const d = 0.4
  const h = 0.82
  return (
    <group>
      <Plinth w={w} d={d} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={PALETTE.concrete} roughness={0.6} flatShading /></mesh>
        <WindowGrid w={w} d={d} yBase={h * 0.6} yTop={h * 0.9} color={PALETTE.glass} glow={0.3} />
        <Storefront w={w} d={d} faceH={h * 0.52} awningColor={PALETTE.accent} signColor={PALETTE.accent} />
        <Parapet w={w} d={d} y={h} color={PALETTE.concrete} />
        <RooftopUnits w={w} y={h} />
      </group>
    </group>
  )
}

/** 관공서 — 콜로네이드(기둥) + 중층 몸통 + 드럼 + 돔. */
export function Civic() {
  const w = 0.4
  const d = 0.34
  const h = 1.05
  return (
    <group>
      <Plinth w={w} d={d} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <Facade w={w} h={h} d={d} color={PALETTE.wallCream} winColor={PALETTE.glassWarm} glow={0.24} rough={0.7} />
        {/* 정면 기둥 4개 + 엔타블러처 */}
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <mesh key={i} position={[x * w, h * 0.22, d / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, h * 0.44, 10]} />
            <meshStandardMaterial color={'#f6f2e8'} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, h * 0.46, d / 2 + 0.03]} castShadow><boxGeometry args={[w * 0.9, 0.05, 0.06]} /><meshStandardMaterial color={'#f6f2e8'} roughness={0.7} /></mesh>
        {/* 드럼 + 돔 */}
        <mesh position={[0, h + 0.06, 0]} castShadow><cylinderGeometry args={[w * 0.34, w * 0.34, 0.12, 16]} /><meshStandardMaterial color={PALETTE.wallCream} roughness={0.7} /></mesh>
        <mesh position={[0, h + 0.12, 0]} castShadow><sphereGeometry args={[w * 0.36, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={PALETTE.glassWarm} roughness={0.3} metalness={0.35} /></mesh>
        <mesh position={[0, h + 0.12 + w * 0.36, 0]}><coneGeometry args={[0.02, 0.08, 8]} /><meshStandardMaterial color={PALETTE.accent} emissive={PALETTE.accent} emissiveIntensity={0.4} /></mesh>
      </group>
    </group>
  )
}

/** 마천루 — 3단 세트백 유리타워 + crown + spire + 비콘. */
export function Skyscraper() {
  const tiers = [
    { w: 0.66, h: 0.95, y: 0 },
    { w: 0.52, h: 0.85, y: 0.95 },
    { w: 0.4, h: 0.7, y: 1.8 },
  ]
  return (
    <group>
      <Plinth w={0.66} color={PALETTE.roofDark} />
      <group position={[0, PLINTH_H, 0]}>
        {tiers.map((t, i) => (
          <group key={i} position={[0, t.y, 0]}>
            <Facade w={t.w} h={t.h} color={PALETTE.concrete.clone().lerp(PALETTE.wallBlue, 0.25)} winColor={PALETTE.glass} glow={0.42} rough={0.2} metal={0.6} />
            <mesh position={[0, t.h + 0.02, 0]}><boxGeometry args={[t.w * 1.05, 0.04, t.w * 1.05]} /><meshStandardMaterial color={PALETTE.wallCream} /></mesh>
          </group>
        ))}
        <group position={[0, 2.5, 0]}>
          <mesh position={[0, 0.21, 0]} castShadow><boxGeometry args={[0.28, 0.42, 0.28]} /><meshStandardMaterial color={PALETTE.roofDark} roughness={0.4} metalness={0.5} flatShading /></mesh>
          <Antenna y={0.42} h={0.5} />
        </group>
      </group>
    </group>
  )
}

// ─────────────────────────── 선택 가능한 건물 레지스트리 ───────────────────────────

export type BuildingKey =
  | 'cottage_cream' | 'cottage_terracotta' | 'cottage_blue' | 'clocktower' | 'windmill' | 'tree'
  | 'hospital' | 'office' | 'apartment' | 'cornerstore' | 'cafe' | 'mart' | 'pharmacy' | 'civic' | 'skyscraper'

export interface BuildingDef {
  label: string
  group: '마을' | '도시'
  element: ReactNode
}

export const BUILDING_LIBRARY: Record<BuildingKey, BuildingDef> = {
  cottage_cream: { label: '타운하우스 (크림)', group: '마을', element: <Cottage wall={PALETTE.wallCream} /> },
  cottage_terracotta: { label: '타운하우스 (테라코타)', group: '마을', element: <Cottage wall={PALETTE.wallTerracotta} /> },
  cottage_blue: { label: '타운하우스 (블루)', group: '마을', element: <Cottage wall={PALETTE.wallBlue} /> },
  clocktower: { label: '시계탑', group: '마을', element: <ClockTower /> },
  windmill: { label: '풍차', group: '마을', element: <Windmill /> },
  tree: { label: '나무', group: '마을', element: <Tree /> },
  hospital: { label: '병원', group: '도시', element: <Hospital /> },
  office: { label: '오피스 타워', group: '도시', element: <Office /> },
  apartment: { label: '아파트', group: '도시', element: <Apartment /> },
  cornerstore: { label: '편의점', group: '도시', element: <CornerStore /> },
  cafe: { label: '카페', group: '도시', element: <Cafe /> },
  mart: { label: '마트', group: '도시', element: <Mart /> },
  pharmacy: { label: '약국', group: '도시', element: <Pharmacy /> },
  civic: { label: '관공서 (돔)', group: '도시', element: <Civic /> },
  skyscraper: { label: '마천루', group: '도시', element: <Skyscraper /> },
}

export const CITY_SLOT_KEYS: BuildingKey[] = [
  'hospital', 'office', 'apartment', 'cornerstore', 'cafe', 'mart', 'pharmacy', 'civic',
]
export const VILLAGE_SLOT_KEYS: BuildingKey[] = [
  'cottage_cream', 'clocktower', 'windmill', 'cottage_terracotta', 'cottage_blue', 'cottage_cream', 'clocktower', 'windmill',
]

// ─────────────────────────── 3단계(LOD) + 테마 ───────────────────────────

export type Stage = 1 | 2 | 3

export type ThemeKey = 'warm' | 'terracotta' | 'cool' | 'stone' | 'forest'
export const THEMES: Record<ThemeKey, { label: string; color: Color }> = {
  warm: { label: '웜 크림', color: PALETTE.wallCream },
  terracotta: { label: '테라코타', color: PALETTE.wallTerracotta },
  cool: { label: '쿨 블루', color: PALETTE.wallBlue },
  stone: { label: '스톤', color: PALETTE.concrete },
  forest: { label: '포레스트', color: PALETTE.bush },
}

type RoofKind = 'pyramid' | 'cone' | 'flat' | 'dome' | 'round' | 'tiers' | 'tree'
interface ShapeDef {
  w: number
  h: number
  body: Color
  roof: RoofKind
}

export const BUILDING_SHAPE: Record<BuildingKey, ShapeDef> = {
  cottage_cream: { w: 0.4, h: 0.72, body: PALETTE.wallCream, roof: 'pyramid' },
  cottage_terracotta: { w: 0.4, h: 0.72, body: PALETTE.wallTerracotta, roof: 'pyramid' },
  cottage_blue: { w: 0.4, h: 0.72, body: PALETTE.wallBlue, roof: 'pyramid' },
  clocktower: { w: 0.26, h: 1.15, body: PALETTE.wallBlue, roof: 'pyramid' },
  windmill: { w: 0.3, h: 0.95, body: PALETTE.wallCream, roof: 'cone' },
  tree: { w: 0.3, h: 0.9, body: PALETTE.bark, roof: 'tree' },
  hospital: { w: 0.4, h: 1.35, body: new Color('#eef1f3'), roof: 'flat' },
  office: { w: 0.34, h: 1.9, body: PALETTE.concrete, roof: 'flat' },
  apartment: { w: 0.4, h: 1.55, body: PALETTE.wallCream, roof: 'flat' },
  cornerstore: { w: 0.4, h: 0.78, body: PALETTE.wallCream, roof: 'flat' },
  cafe: { w: 0.34, h: 0.62, body: PALETTE.wallTerracotta, roof: 'flat' },
  mart: { w: 0.46, h: 0.82, body: PALETTE.concrete, roof: 'flat' },
  pharmacy: { w: 0.32, h: 1.0, body: PALETTE.wallCream, roof: 'flat' },
  civic: { w: 0.4, h: 1.05, body: PALETTE.wallCream, roof: 'dome' },
  skyscraper: { w: 0.66, h: 2.5, body: PALETTE.concrete, roof: 'tiers' },
}

function Roof2({ kind, w, h }: { kind: RoofKind; w: number; h: number }) {
  switch (kind) {
    case 'pyramid':
      return <PitchedRoof w={w} y={h} height={0.26} color={PALETTE.roof} />
    case 'cone':
      return <mesh position={[0, h + 0.08, 0]} castShadow><coneGeometry args={[w * 0.6, 0.2, 10]} /><meshStandardMaterial color={PALETTE.roofDark} roughness={0.9} flatShading /></mesh>
    case 'dome':
      return <mesh position={[0, h + 0.02, 0]} castShadow><sphereGeometry args={[w * 0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={PALETTE.glassWarm} roughness={0.4} metalness={0.3} /></mesh>
    case 'round':
      return <mesh position={[0, h + 0.06, 0]} castShadow><cylinderGeometry args={[w * 0.62, w * 0.5, 0.12, 10]} /><meshStandardMaterial color={PALETTE.roof} roughness={0.9} flatShading /></mesh>
    case 'flat':
      return <Parapet w={w} y={h} color={PALETTE.concrete} />
    default:
      return null
  }
}

/** 2단계: 특유의 실루엣(주춧돌 + 몸통 + 지붕), 창·간판 등 디테일 생략. */
export function Stage2({ k }: { k: BuildingKey }) {
  const s = BUILDING_SHAPE[k]
  if (k === 'skyscraper') {
    const tiers = [
      { w: 0.66, h: 0.95, y: 0 }, { w: 0.52, h: 0.85, y: 0.95 }, { w: 0.4, h: 0.7, y: 1.8 },
    ]
    return (
      <group>
        <Plinth w={0.66} color={PALETTE.roofDark} />
        <group position={[0, PLINTH_H, 0]}>
          {tiers.map((t, i) => (
            <mesh key={i} position={[0, t.y + t.h / 2, 0]} castShadow receiveShadow><boxGeometry args={[t.w, t.h, t.w]} /><meshStandardMaterial color={PALETTE.concrete} roughness={0.5} metalness={0.2} flatShading /></mesh>
          ))}
        </group>
      </group>
    )
  }
  if (k === 'tree') {
    return (
      <group>
        <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.13, 0.16, 0.9, 7]} /><meshStandardMaterial color={PALETTE.bark} roughness={0.95} flatShading /></mesh>
        <mesh position={[0, 1.4, 0]} castShadow><icosahedronGeometry args={[0.6, 1]} /><meshStandardMaterial color={PALETTE.foliage} roughness={1} flatShading /></mesh>
      </group>
    )
  }
  return (
    <group>
      <Plinth w={s.w} color={PALETTE.concrete} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, s.h / 2, 0]} castShadow receiveShadow><boxGeometry args={[s.w, s.h, s.w]} /><meshStandardMaterial color={s.body} roughness={0.7} flatShading /></mesh>
        <Roof2 kind={s.roof} w={s.w} h={s.h} />
      </group>
    </group>
  )
}

/** 1단계: 테마로 통일된 균일 shell (일관화). 종류와 무관하게 동일 형상. */
export function Stage1({ theme }: { theme: ThemeKey }) {
  const c = THEMES[theme].color
  const cap = c.clone().multiplyScalar(0.78)
  return (
    <group>
      <Plinth w={0.34} color={cap} />
      <group position={[0, PLINTH_H, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow><boxGeometry args={[0.32, 0.48, 0.32]} /><meshStandardMaterial color={c} roughness={0.85} flatShading /></mesh>
        <PitchedRoof w={0.32} y={0.48} height={0.16} color={cap} />
      </group>
    </group>
  )
}

export function StageBuilding({ k, stage, theme }: { k: BuildingKey; stage: Stage; theme: ThemeKey }) {
  if (stage === 3) return <>{BUILDING_LIBRARY[k].element}</>
  if (stage === 2) return <Stage2 k={k} />
  return <Stage1 theme={theme} />
}
