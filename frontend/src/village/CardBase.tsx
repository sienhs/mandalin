import { SPAN } from './layout'
import type { Terrain } from './villageApi'

/**
 * 마을을 받치는 얇은 판.
 *
 * <p>`FloatingBase`(매달린 암반 1,296 인스턴스)를 대신한다. 암반은 "떠 있는 섬"이라는
 * 판타지 톤을 만드는데, 2D 화면은 흰 카드 위에 얹힌 담백한 도시라 둘이 어울리지 않았다.
 * 여기서는 <b>카드 한 장</b>처럼 보이게 얇은 판과 옆면만 남긴다.
 *
 * <p>부수 효과가 크다 — 인스턴스 1,296개와 그 그림자가 통째로 사라져 draw call 과
 * 그림자맵 부하가 크게 줄어든다. 예전 모습이 필요하면 `islandBase` 를 켜면 된다.
 */

/** 판 두께. 옆면이 보일 만큼만 준다. */
const THICKNESS = 1.1

const EDGE: Record<Terrain, string> = {
  GRASS_PATH: '#c8bda6',
  CITY_ROAD: '#b6bcc4',
  DIRT_ROAD: '#c9ab7f',
  WATER_WAY: '#a9c6cf',
}

export function CardBase({ terrain }: { terrain: Terrain }) {
  const size = SPAN + 1.2
  const edge = EDGE[terrain] ?? EDGE.GRASS_PATH

  return (
    <group>
      {/*
        판 본체. 지표면(y≈0)보다 살짝 아래에서 시작해 옆면만 드러낸다.
        윗면은 지형 렌더러가 덮으므로 여기서 그리지 않는다.
      */}
      <mesh position={[0, -THICKNESS / 2 - 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[size, THICKNESS, size]} />
        <meshStandardMaterial color={edge} roughness={0.95} />
      </mesh>

      {/*
        아래 그림자. 실제 그림자맵 대신 반투명 원을 깔아 "떠 있다"를 표현한다.
        그림자 카메라 범위를 섬 아래까지 늘리지 않아도 되므로 그림자 해상도가 보존된다.
      */}
      <mesh position={[0, -THICKNESS - 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.62, 48]} />
        <meshBasicMaterial color="#233238" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  )
}
