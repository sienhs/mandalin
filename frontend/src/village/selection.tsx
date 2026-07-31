import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial } from 'three'

/**
 * 선택·호버 표시.
 *
 * 기존에는 노란 링을 바닥에 깔았는데, 지형 색과 뒤섞여 "월드의 일부"처럼 보이고
 * 4각 링은 계단처럼 각져 보였다. 여기서는 UI 레이어임이 분명하게 읽히도록
 *  - 채도 낮은 청백색만 쓰고
 *  - 면을 채우지 않고 얇은 선/모서리 브래킷으로만 표시하고
 *  - 아주 느린 호흡(pulse)으로 살아있음을 알린다.
 *
 * 모든 요소는 depthWrite 를 끄고 바닥보다 살짝 위에 띄워 z-fighting 을 피한다.
 */

const HOVER = '#dceefb'
const ACTIVE = '#7fd8ff'

/**
 * 대상을 감싸는 모서리 브래킷 4개(ㄱ 자). 사각 링보다 가볍고 조준선처럼 읽힌다.
 *
 * ⚠️ 이 컴포넌트는 `rotation={[-π/2, 0, 0]}` 로 눕혀진 부모 안에서만 쓴다.
 * 그 회전에서 로컬 (x,y,z) 는 월드 (x, z, -y) 로 간다 — 즉 <b>로컬 z 를 쓰면 월드 높이가
 * 되어 브래킷이 공중에 뜬다</b>. 바닥에 눕히려면 로컬 x·y 평면만 쓰고 z 는 0 으로 둬야 한다.
 */
function CornerBrackets({
  half, arm, thickness, color, opacity,
}: {
  half: number
  arm: number
  thickness: number
  color: string
  opacity: number
}) {
  const corners: [number, number][] = [
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ]
  return (
    <group>
      {corners.map(([sx, sy]) => (
        <group key={`${sx}${sy}`} position={[sx * half, sy * half, 0]}>
          {/* 가로 팔 (월드 x) */}
          <mesh position={[-sx * arm * 0.5, 0, 0]}>
            <planeGeometry args={[arm, thickness]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
          </mesh>
          {/* 세로 팔 (월드 z) */}
          <mesh position={[0, -sy * arm * 0.5, 0]}>
            <planeGeometry args={[thickness, arm]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 건물 자리(셀) 표시.
 * hover 는 얇은 원선만, 선택은 원선 + 브래킷 + 느린 회전.
 */
export function CellSelection({ hovered, active }: { hovered: boolean; active: boolean }) {
  const spin = useRef<Group>(null)
  const ring = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (spin.current) spin.current.rotation.z = t * 0.25
    if (ring.current) {
      // 0.42~0.58 사이를 천천히 오가는 호흡. 깜빡임이 아니라 숨쉬는 느낌으로.
      const material = ring.current.material as MeshBasicMaterial
      material.opacity = active ? 0.72 + Math.sin(t * 1.6) * 0.18 : 0.5
    }
  })

  if (!hovered && !active) return null

  return (
    // 바닥(y=0)보다 살짝 위. 지형 소품 위로 올라오되 건물을 가리지 않는 높이.
    <group position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/*
        크기가 중요하다. 건물은 ref 폭 0.4 에 BUILD_SCALE 2.4 가 걸려 바닥이 약 1.0 unit
        이라, 반지름 0.9 짜리 링은 건물 발밑에 깔려 통째로 가려진다. 칸 절반(1.3) 안쪽에서
        건물보다 넉넉히 크게 잡아 건물을 "감싸게" 한다.
        선 두께도 월드 단위다 — 마을 전체가 화면 폭 1200px 에 들어가면 1 unit ≈ 20px 이라
        0.04 는 1px 도 안 돼 보이지 않는다.
      */}
      <mesh ref={ring}>
        <ringGeometry args={[1.1, 1.26, 64]} />
        <meshBasicMaterial
          color={active ? ACTIVE : HOVER}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {active && (
        <>
          <group ref={spin}>
            <CornerBrackets half={1.18} arm={0.52} thickness={0.17} color={ACTIVE} opacity={0.95} />
          </group>
          {/* 옅은 안쪽 채움 — 어느 칸인지 한눈에 잡히게 */}
          <mesh>
            <circleGeometry args={[1.1, 48]} />
            <meshBasicMaterial color={ACTIVE} transparent opacity={0.16} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

/**
 * 블록(도메인) 선택 표시.
 * 사방을 두른 노란 사각 링을 없애고 모서리 브래킷만 남긴다 — 블록 안 건물들을 가리지 않는다.
 */
export function BlockSelection({ size }: { size: number }) {
  const group = useRef<Group>(null)

  useFrame((state) => {
    if (!group.current) return
    // 아주 미세하게만 커졌다 작아진다. 블록이 크므로 진폭을 작게 둬야 산만하지 않다.
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.006
    group.current.scale.setScalar(pulse)
  })

  return (
    <group ref={group} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <CornerBrackets
        half={size * 0.52}
        arm={size * 0.18}
        thickness={0.28}
        color={ACTIVE}
        opacity={0.95}
      />
    </group>
  )
}
