import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { BoxGeometry, Vector2, type Group } from 'three'
import { PALETTE, resolveColor } from './palette'
import {
  DETAIL_KINDS,
  LANDMARK_REF,
  PL,
  type LandmarkStage,
  type Part,
  type Stage,
  type ThemeKey,
  THEMES,
  type Vec3,
} from './partTypes'

/**
 * 데이터 드리븐 건물 렌더러.
 * 부품(Part) 배열을 해석해 로우폴리 건물을 그린다. 부품 종류가 늘 때만 이 파일을 고친다.
 *
 * ⚠️ 카탈로그(어떤 건물이 존재하는가)는 여기서 import 하지 않는다. parts 를 인자로 받을 뿐이라
 * /village 는 서버가 내려준 보유 건물의 parts 를, 개발용 페이지는 로컬 카탈로그의 parts 를
 * 같은 렌더러에 흘려보낼 수 있다.
 */

/**
 * 공유 단위 박스(1×1×1). 크기는 `geometry` 가 아니라 **mesh.scale** 로 준다.
 *
 * 예전에는 mesh 마다 `<boxGeometry args={[w, h, d]} />` 를 썼는데, 그러면 크기가 다른 만큼
 * BufferGeometry 가 새로 생긴다. 완성 단계(진행률 75% 이상)의 마을에서 geometry 가 1,007개까지
 * 늘어났다 — 전부 같은 정육면체인데 정점 버퍼만 1,007벌이었다.
 *
 * 공유하면 GPU 버퍼가 한 벌로 줄고, 연속된 draw 사이에 정점 버퍼를 다시 바인딩하지 않는다.
 * 비균등 스케일이어도 three 가 normalMatrix 를 따로 계산하므로 조명·flatShading 은 그대로다.
 *
 * ⚠️ 공유 자원이라 절대 dispose 하면 안 된다. 모듈 수명과 같이 두고, 필요하면 여기만 본다.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1)

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
      <mesh position={[0, 0.015, 0]} castShadow geometry={UNIT_BOX} scale={[w * 1.12, 0.03, d * 1.12]}><meshStandardMaterial color={c.clone().multiplyScalar(0.8)} roughness={0.9} /></mesh>
      <mesh position={[0, height / 2 + 0.03, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[Math.max(w, d) * 0.82, height, 4]} /><meshStandardMaterial color={c} roughness={0.9} flatShading /></mesh>
    </group>
  )
}

function Parapet({ w, d = w, y, color }: { w: number; d?: number; y: number; color: string }) {
  const c = resolveColor(color)
  const t = 0.03, ph = 0.07
  return (
    <group position={[0, y + ph / 2, 0]}>
      <mesh position={[0, 0, d / 2]} geometry={UNIT_BOX} scale={[w + t, ph, t]}><meshStandardMaterial color={c} roughness={0.85} /></mesh>
      <mesh position={[0, 0, -d / 2]} geometry={UNIT_BOX} scale={[w + t, ph, t]}><meshStandardMaterial color={c} roughness={0.85} /></mesh>
      <mesh position={[w / 2, 0, 0]} geometry={UNIT_BOX} scale={[t, ph, d + t]}><meshStandardMaterial color={c} roughness={0.85} /></mesh>
      <mesh position={[-w / 2, 0, 0]} geometry={UNIT_BOX} scale={[t, ph, d + t]}><meshStandardMaterial color={c} roughness={0.85} /></mesh>
    </group>
  )
}

function RooftopUnits({ w, y }: { w: number; y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[-w * 0.18, 0.05, w * 0.1]} castShadow geometry={UNIT_BOX} scale={[w * 0.3, 0.1, w * 0.25]}><meshStandardMaterial color={resolveColor('roofDark')} roughness={0.8} /></mesh>
      <mesh position={[w * 0.2, 0.07, -w * 0.12]} castShadow geometry={UNIT_BOX} scale={[w * 0.18, 0.14, w * 0.18]}><meshStandardMaterial color={resolveColor('concrete')} roughness={0.8} /></mesh>
      <mesh position={[w * 0.05, 0.06, w * 0.22]} castShadow><cylinderGeometry args={[0.03, 0.03, 0.12, 8]} /><meshStandardMaterial color={resolveColor('roofDark')} /></mesh>
    </group>
  )
}

function CrossPart({ y, z = 0, color, s = 1 }: { y: number; z?: number; color: string; s?: number }) {
  const c = resolveColor(color)
  return (
    <group position={[0, y, z]}>
      <mesh geometry={UNIT_BOX} scale={[0.17 * s, 0.055 * s, 0.03]}><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.45} /></mesh>
      <mesh geometry={UNIT_BOX} scale={[0.055 * s, 0.17 * s, 0.03]}><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.45} /></mesh>
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
      <mesh position={[0, faceH * 0.72, z + w * 0.05]} rotation={[-Math.PI / 8, 0, 0]} castShadow geometry={UNIT_BOX} scale={[w * 0.98, 0.02, w * 0.24]}><meshStandardMaterial color={resolveColor(awning)} roughness={0.8} /></mesh>
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
      <mesh position={[0, y + h + 0.025, d / 2 + 0.03]} castShadow geometry={UNIT_BOX} scale={[w * 0.9, 0.05, 0.06]}><meshStandardMaterial color={c} roughness={0.7} /></mesh>
    </group>
  )
}

function BalconiesPart({ w, d = w, y0, y1, floors, color }: { w: number; d?: number; y0: number; y1: number; floors: number; color: string }) {
  const c = resolveColor(color)
  return (
    <group>
      {Array.from({ length: floors }).map((_, i) => {
        const y = floors === 1 ? y0 : y0 + (y1 - y0) * (i / (floors - 1))
        return <mesh key={i} position={[0, y, d / 2 + 0.03]} castShadow geometry={UNIT_BOX} scale={[w * 0.92, 0.02, 0.06]}><meshStandardMaterial color={c} roughness={0.8} /></mesh>
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
          <mesh position={[0, 0.28, 0]} castShadow geometry={UNIT_BOX} scale={[0.05, 0.5, 0.02]}><meshStandardMaterial color={resolveColor('wood')} roughness={0.7} /></mesh>
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

// ─────────── 랜드마크(3×3) 전용 부품 ───────────

/**
 * 회전체 프로파일로 만드는 링/보울.
 *
 * 가운데가 뚫린 기둥은 three 기본 지오메트리에 없다. 단면(사각형)을 닫힌 폴리라인으로 주고
 * lathe 로 돌리면 안·바깥 벽 + 위·아래 면이 한 번에 나온다 — 세그먼트 수를 줄이면 그대로
 * 오각형·팔각형 링이 되므로 폴리곤 링도 같은 코드로 처리한다.
 */
function LatheBand({
  profile, seg, color, sx = 1, sz = 1, y = 0, rot = 0, flat = true,
}: {
  profile: [number, number][]
  seg: number
  color: string
  sx?: number
  sz?: number
  y?: number
  rot?: number
  flat?: boolean
}) {
  const points = useMemo(() => profile.map(([r, h]) => new Vector2(r, h)), [profile])
  return (
    <mesh position={[0, y, 0]} rotation={[0, rot, 0]} scale={[sx, 1, sz]} castShadow receiveShadow>
      <latheGeometry args={[points, seg]} />
      <meshStandardMaterial color={resolveColor(color)} roughness={0.8} flatShading={flat} side={2} />
    </mesh>
  )
}

/** 정n각 기둥. hollow 를 주면 중정이 뚫린 n각 링. */
function PolyPrismPart({
  sides, r, h, y = 0, x = 0, z = 0, rot = 0, hollow, color, rough = 0.8, metal = 0.05,
}: {
  sides: number; r: number; h: number; y?: number; x?: number; z?: number; rot?: number
  hollow?: number; color: string; rough?: number; metal?: number
}) {
  // 정n각형의 "평평한 면"이 정면(+z)을 보게 반 세그먼트만큼 돌려준다.
  const align = rot + Math.PI / sides
  if (hollow != null && hollow > 0 && hollow < 1) {
    const ri = r * hollow
    return (
      <group position={[x, 0, z]}>
        <LatheBand
          profile={[[ri, 0], [r, 0], [r, h], [ri, h], [ri, 0]]}
          seg={sides}
          color={color}
          y={y}
          rot={align}
        />
      </group>
    )
  }
  return (
    <mesh position={[x, y + h / 2, z]} rotation={[0, align, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, sides]} />
      <meshStandardMaterial color={resolveColor(color)} roughness={rough} metalness={metal} flatShading />
    </mesh>
  )
}

/** 원·타원 링 (경기장 외벽). */
function RingPart({
  ro, ri, h, y = 0, sx = 1, sz = 1, seg = 28, color,
}: {
  ro: number; ri: number; h: number; y?: number; sx?: number; sz?: number; seg?: number; color: string
}) {
  return (
    <LatheBand
      profile={[[ri, 0], [ro, 0], [ro, h], [ri, h], [ri, 0]]}
      seg={seg}
      color={color}
      sx={sx}
      sz={sz}
      y={y}
      flat={seg <= 12}
    />
  )
}

/** 안쪽으로 기울어진 관중석. 바깥이 높고 안쪽(경기장 중앙)이 낮다. */
function BowlPart({
  ro, ri, h, y = 0, sx = 1, sz = 1, seg = 28, color,
}: {
  ro: number; ri: number; h: number; y?: number; sx?: number; sz?: number; seg?: number; color: string
}) {
  const t = 0.05
  return (
    <LatheBand
      profile={[[ri, 0], [ro, h], [ro, h - t], [ri, -t], [ri, 0]]}
      seg={seg}
      color={color}
      sx={sx}
      sz={sz}
      y={y}
      flat={false}
    />
  )
}

/** 아치 개구부 — 기둥 2개 + 반원 상부를 짧은 박스로 근사. */
function ArchPart({
  w, h, d, thick, x = 0, z = 0, y = 0, rotY = 0, seg = 7, color,
}: {
  w: number; h: number; d: number; thick: number; x?: number; z?: number; y?: number
  rotY?: number; seg?: number; color: string
}) {
  const c = resolveColor(color)
  const r = w / 2
  const spring = Math.max(0.02, h - r)
  const mid = r + thick / 2
  const step = Math.PI / seg
  // 반원을 seg 개 조각으로 나눠 각 조각을 회전한 박스로 놓는다. 세그먼트가 서로 조금
  // 겹치도록 길이를 여유 있게 잡아야 조각 사이가 벌어지지 않는다.
  const chord = 2 * mid * Math.tan(step / 2) + thick * 0.35
  return (
    <group position={[x, y, z]} rotation={[0, rotY, 0]}>
      {[-1, 1].map((sign) => (
        <mesh key={sign} position={[sign * (r + thick / 2), spring / 2, 0]} castShadow receiveShadow geometry={UNIT_BOX} scale={[thick, spring, d]}>
          <meshStandardMaterial color={c} roughness={0.85} flatShading />
        </mesh>
      ))}
      {Array.from({ length: seg }).map((_, i) => {
        const a = step * (i + 0.5)
        return (
          <mesh
            key={i}
            position={[-Math.cos(a) * mid, spring + Math.sin(a) * mid, 0]}
            rotation={[0, 0, a - Math.PI / 2]}
            castShadow geometry={UNIT_BOX} scale={[thick, chord, d]}>
            <meshStandardMaterial color={c} roughness={0.85} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

/** 격자 철탑 — 네 모서리 기둥이 좁아지며 층마다 수평재. */
function LatticePart({
  w, h, y = 0, taper = 0.35, rungs = 6, color,
}: {
  w: number; h: number; y?: number; taper?: number; rungs?: number; color: string
}) {
  const c = resolveColor(color)
  const t = Math.max(0.02, w * 0.075)
  const levels = Math.max(2, rungs)
  const halfAt = (f: number) => (w / 2) * (1 - (1 - taper) * f)
  const segH = h / levels
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: levels }).map((_, i) => {
        const f0 = i / levels
        const f1 = (i + 1) / levels
        const half = (halfAt(f0) + halfAt(f1)) / 2
        const yc = segH * i
        const corners: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
        return (
          <group key={i}>
            {corners.map(([sx, sz]) => (
              <mesh key={`${sx}${sz}`} position={[sx * half, yc + segH / 2, sz * half]} castShadow geometry={UNIT_BOX} scale={[t, segH, t]}>
                <meshStandardMaterial color={c} roughness={0.6} metalness={0.35} flatShading />
              </mesh>
            ))}
            {/* 수평재 — 층 경계마다 한 겹 */}
            <mesh position={[0, yc + segH, 0]} castShadow geometry={UNIT_BOX} scale={[halfAt(f1) * 2 + t, t * 0.7, t]}>
              <meshStandardMaterial color={c} roughness={0.6} metalness={0.35} flatShading />
            </mesh>
            <mesh position={[0, yc + segH, 0]} castShadow geometry={UNIT_BOX} scale={[t, t * 0.7, halfAt(f1) * 2 + t]}>
              <meshStandardMaterial color={c} roughness={0.6} metalness={0.35} flatShading />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** 조가비 쉘 지붕 — 반구 sector 를 눌러 세운다. */
function ShellPart({
  w, h, d, pos, rotY = 0, color,
}: {
  w: number; h: number; d: number; pos: Vec3; rotY?: number; color: string
}) {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]} scale={[w / 2, h, d / 2]} castShadow receiveShadow>
      <sphereGeometry args={[1, 18, 12, 0, Math.PI, 0, Math.PI / 2]} />
      <meshStandardMaterial color={resolveColor(color)} roughness={0.35} metalness={0.15} side={2} />
    </mesh>
  )
}

/** 경기장 조명탑. */
function FloodlightPart({ pos, h, color = 'concrete' }: { pos: Vec3; h: number; color?: string }) {
  const glow = resolveColor('glassWarm')
  return (
    <group position={pos}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.03, h, 6]} />
        <meshStandardMaterial color={resolveColor(color)} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, h + 0.05, 0]} castShadow geometry={UNIT_BOX} scale={[0.2, 0.1, 0.05]}>
        <meshStandardMaterial color={resolveColor('roofDark')} roughness={0.6} />
      </mesh>
      <mesh position={[0, h + 0.05, 0.032]}>
        <planeGeometry args={[0.19, 0.09]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

/** 수반·반사 못. 광장 바닥보다 살짝 낮게 깔린다. */
function PoolPart({
  w, d = w, x = 0, z = 0, y = 0, color = 'water',
}: {
  w: number; d?: number; x?: number; z?: number; y?: number; color?: string
}) {
  const c = resolveColor(color)
  return (
    <group position={[x, y, z]}>
      {/* 테두리를 먼저 깔고 그 위에 수면을 얹는다. 순서가 뒤바뀌면 테두리가 물을 덮는다. */}
      <mesh position={[0, 0.011, 0]} receiveShadow geometry={UNIT_BOX} scale={[w + 0.07, 0.022, d + 0.07]}>
        <meshStandardMaterial color={resolveColor('stoneLight')} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.028, 0]} receiveShadow geometry={UNIT_BOX} scale={[w, 0.014, d]}>
        <meshStandardMaterial color={c} roughness={0.12} metalness={0.55} />
      </mesh>
    </group>
  )
}

// ─────────── 부품 → JSX 디스패치 ───────────

function renderPart(p: Part, stage: Stage, i: number, details = true) {
  if (stage === 2 && DETAIL_KINDS.has(p.k)) return null
  // 성능 옵션. 디테일 부품은 완성 단계(3) draw call 의 약 40% 를 차지한다.
  if (!details && DETAIL_KINDS.has(p.k)) return null
  switch (p.k) {
    case 'plinth': {
      const c = resolveColor(p.color)
      return <mesh key={i} position={[0, PL / 2, 0]} castShadow receiveShadow geometry={UNIT_BOX} scale={[p.w * 1.14, PL, (p.d ?? p.w) * 1.14]}><meshStandardMaterial color={c} roughness={0.95} /></mesh>
    }
    case 'box': {
      const c = resolveColor(p.color)
      const y = p.y ?? 0
      return (
        <group key={i} position={[p.x ?? 0, 0, p.z ?? 0]}>
          <mesh position={[0, y + p.h / 2, 0]} castShadow receiveShadow geometry={UNIT_BOX} scale={[p.w, p.h, p.d ?? p.w]}>
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
    case 'polyPrism':
      return <PolyPrismPart key={i} sides={p.sides} r={p.r} h={p.h} y={p.y} x={p.x} z={p.z} rot={p.rot} hollow={p.hollow} color={p.color} rough={p.rough} metal={p.metal} />
    case 'ring':
      return <RingPart key={i} ro={p.ro} ri={p.ri} h={p.h} y={p.y} sx={p.sx} sz={p.sz} seg={p.seg} color={p.color} />
    case 'bowl':
      return <BowlPart key={i} ro={p.ro} ri={p.ri} h={p.h} y={p.y} sx={p.sx} sz={p.sz} seg={p.seg} color={p.color} />
    case 'arch':
      return <ArchPart key={i} w={p.w} h={p.h} d={p.d} thick={p.thick} x={p.x} z={p.z} y={p.y} rotY={p.rotY} seg={p.seg} color={p.color} />
    case 'lattice':
      return <LatticePart key={i} w={p.w} h={p.h} y={p.y} taper={p.taper} rungs={p.rungs} color={p.color} />
    case 'shell':
      return <ShellPart key={i} w={p.w} h={p.h} d={p.d} pos={p.pos} rotY={p.rotY} color={p.color} />
    case 'floodlight':
      return <FloodlightPart key={i} pos={p.pos} h={p.h} color={p.color} />
    case 'pool':
      return <PoolPart key={i} w={p.w} d={p.d} x={p.x} z={p.z} y={p.y} color={p.color} />
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
      <mesh position={[0, PL / 2, 0]} receiveShadow geometry={UNIT_BOX} scale={[0.34 * 1.14, PL, 0.34 * 1.14]}><meshStandardMaterial color={cap} roughness={0.95} /></mesh>
      <mesh position={[0, PL + 0.24, 0]} castShadow receiveShadow geometry={UNIT_BOX} scale={[0.32, 0.48, 0.32]}><meshStandardMaterial color={c} roughness={0.85} flatShading /></mesh>
      <PitchedRoof w={0.32} y={PL + 0.48} height={0.16} color={theme === 'stone' ? 'concrete' : 'roof'} />
    </group>
  )
}

/**
 * 단계별 디스패치: 1=일관화 shell, 2=형태(디테일 생략), 3=완성.
 * 1단계는 모든 건물이 같은 shell 이라 parts 없이도 그릴 수 있다.
 */
export function StageParts({
  parts, stage, theme, details = true,
}: { parts: Part[] | null; stage: Stage; theme: ThemeKey; details?: boolean }) {
  if (stage === 1) return <Stage1 theme={theme} />
  if (!parts) return null
  return <group>{parts.map((p, i) => renderPart(p, stage, i, details))}</group>
}

// ─────────── 랜드마크 8단계 렌더 ───────────

/**
 * 0단계 공사 부지 — 흙 패드 + 가설 울타리 + 타워크레인 + 자재 더미.
 *
 * 랜드마크를 아직 세울 수 없을 때(진행률 0 또는 미보유) 중앙을 빈 바닥으로 두면 마을이
 * 고장난 것처럼 보인다. "여기에 뭔가 올라온다"를 부지 자체가 말해야 한다.
 */
export function ConstructionSite({ span = LANDMARK_REF }: { span?: number }) {
  const half = span / 2
  const posts = 7
  const fence: Vec3[] = []
  for (let i = 0; i < posts; i++) {
    const t = (i / (posts - 1) - 0.5) * span * 0.94
    fence.push([t, 0, half * 0.94], [t, 0, -half * 0.94], [half * 0.94, 0, t], [-half * 0.94, 0, t])
  }
  return (
    <group>
      <mesh position={[0, 0.02, 0]} receiveShadow geometry={UNIT_BOX} scale={[span * 0.96, 0.04, span * 0.96]}>
        <meshStandardMaterial color={resolveColor('soil')} roughness={1} />
      </mesh>

      {/* 가설 울타리 */}
      {fence.map((p, i) => (
        <mesh key={i} position={[p[0], 0.14, p[2]]} castShadow geometry={UNIT_BOX} scale={[0.06, 0.28, 0.06]}>
          <meshStandardMaterial color={resolveColor('wood')} roughness={0.9} />
        </mesh>
      ))}

      {/* 기초 파일 */}
      {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5], [0, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.06, z]} receiveShadow geometry={UNIT_BOX} scale={[0.5, 0.12, 0.5]}>
          <meshStandardMaterial color={resolveColor('concrete')} roughness={0.95} />
        </mesh>
      ))}

      {/* 타워크레인 */}
      <group position={[half * 0.6, 0, -half * 0.6]}>
        <mesh position={[0, 0.06, 0]} receiveShadow geometry={UNIT_BOX} scale={[0.34, 0.12, 0.34]}>
          <meshStandardMaterial color={resolveColor('concrete')} roughness={0.95} />
        </mesh>
        <LatticePart w={0.2} h={1.5} y={0.12} taper={0.9} rungs={5} color="accent" />
        <mesh position={[-0.5, 1.68, 0]} castShadow geometry={UNIT_BOX} scale={[1.5, 0.08, 0.08]}>
          <meshStandardMaterial color={resolveColor('accent')} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[-1.0, 1.45, 0]} geometry={UNIT_BOX} scale={[0.02, 0.4, 0.02]}>
          <meshStandardMaterial color={resolveColor('roofDark')} />
        </mesh>
        <mesh position={[-1.0, 1.2, 0]} castShadow geometry={UNIT_BOX} scale={[0.14, 0.14, 0.14]}>
          <meshStandardMaterial color={resolveColor('roofDark')} roughness={0.7} />
        </mesh>
      </group>

      {/* 자재 더미 */}
      <mesh position={[-half * 0.6, 0.09, half * 0.55]} castShadow geometry={UNIT_BOX} scale={[0.5, 0.18, 0.3]}>
        <meshStandardMaterial color={resolveColor('path')} roughness={0.95} />
      </mesh>
      <mesh position={[-half * 0.6, 0.24, half * 0.55]} castShadow geometry={UNIT_BOX} scale={[0.42, 0.12, 0.26]}>
        <meshStandardMaterial color={resolveColor('wood')} roughness={0.95} />
      </mesh>
    </group>
  )
}

/**
 * 랜드마크 8단계 렌더.
 *
 * 일반 건물처럼 단계마다 표현 규칙을 바꾸지 않고, **부품의 `st`(등장 단계) 로만** 자란다.
 * 그래서 보이는 부품은 항상 "완성 규칙"(stage 3)으로 그린다 — 창문·디테일이 붙은 채로
 * 매스가 하나씩 올라가는 게 공사 진행처럼 읽힌다.
 */
export function LandmarkParts({
  parts, stage, details = true,
}: { parts: Part[] | null; stage: LandmarkStage; details?: boolean }) {
  if (stage === 0 || !parts) return <ConstructionSite />
  return (
    <group>
      {parts.map((p, i) => ((p.st ?? 1) <= stage ? renderPart(p, 3, i, details) : null))}
    </group>
  )
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
      <mesh position={[0, 0.03, 0]} receiveShadow geometry={UNIT_BOX} scale={[0.5, 0.06, 0.5]}><meshStandardMaterial color={PALETTE.soil} roughness={1} /></mesh>
      {cells.map(([x, z], i) => (
        <group key={i} position={[x, 0.06, z]}>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.008, 0.008, 0.16, 5]} /><meshStandardMaterial color={PALETTE.foliage} /></mesh>
          <mesh position={[0, 0.18, 0]}><icosahedronGeometry args={[0.05, 0]} /><meshStandardMaterial color={flowers[i % flowers.length]} roughness={0.6} /></mesh>
        </group>
      ))}
    </group>
  )
}
