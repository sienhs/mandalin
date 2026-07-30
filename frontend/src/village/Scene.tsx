import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { Village } from './Village'
import { SKY } from './terrain'
import type { CellOverride } from './GrowableObject'
import type { LandmarkOverride } from './Landmark'
import type { ThemeKey } from './partTypes'
import type { OwnedCatalog } from './ownedCatalog'
import type { Terrain } from './villageApi'
import type { Mandalart } from './types'

interface Props {
  mandalart: Mandalart
  selected: number | null
  overrides: Record<string, CellOverride>
  themes: Record<string, ThemeKey>
  terrain: Terrain
  catalog: OwnedCatalog
  selectedTaskId: string | null
  landmark: LandmarkOverride
  onSelect: (domainIndex: number) => void
  onSelectTask: (taskId: string) => void
}

/** R3F Canvas + 조명 + OrbitControls. isometric 느낌의 초기 시점. */
export function Scene({
  mandalart, selected, overrides, themes, terrain, catalog, selectedTaskId, landmark,
  onSelect, onSelectTask,
}: Props) {
  const sky = SKY[terrain]

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true }}
      // 섬이 "떠 있다"는 게 보이려면 눈높이가 낮아야 한다. 예전 [31,28,31] 은
      // 거의 위에서 내려보는 각도라 측면 암반이 한 줄로만 보였다.
      camera={{ position: [54, 25, 54], fov: 38 }}
      onPointerMissed={() => onSelect(-1)}
    >
      <color attach="background" args={[sky.bg]} />
      <Sky sunPosition={sky.sun} turbidity={sky.turbidity} rayleigh={sky.rayleigh} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={sky.sun}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        // 섬 아래 매달린 암반(최대 depth 28 + 늘어진 침)까지 그림자 범위에 넣는다.
        shadow-camera-near={0.5}
        shadow-camera-far={180}
      />

      {/*
        ⚠️ 이 Suspense 를 지우면 마을이 흰 화면이 된다.

        블록 라벨에 쓰는 drei `Text` 는 폰트를 preload 하려고 `suspend()` 를 부른다
        (`@react-three/drei/core/Text.js`). 이 캔버스 안에 경계가 없으면 그 suspend 가 밖으로
        올라가 **가장 가까운 Suspense = 라우터의 lazy 경계**에 잡히고, 그러면 `Scene` 자체가
        언마운트된다. R3F 는 언마운트 때 `forceContextLoss()` 를 부르므로 WebGL 컨텍스트가
        죽고, 폰트가 로드돼 다시 마운트될 때는 이미 죽은 컨텍스트가 남아 있다. 복구 핸들러가
        없어서 새로고침 전까지 흰 화면이다 — 콘솔에는 `THREE.WebGLRenderer: Context Lost` 만
        찍혀서 GPU 부하 문제로 오해하기 쉽다(부하·그림자맵·dpr 과는 무관하다).

        경계를 캔버스 안에 두면 폰트 로딩 동안 라벨만 잠깐 비고 캔버스는 계속 살아 있다.
      */}
      <Suspense fallback={null}>
        <Village
          mandalart={mandalart}
          selected={selected}
          overrides={overrides}
          themes={themes}
          terrain={terrain}
          catalog={catalog}
          selectedTaskId={selectedTaskId}
          landmark={landmark}
          onSelect={onSelect}
          onSelectTask={onSelectTask}
        />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan
        minDistance={10}
        maxDistance={120}
        // 수평보다 살짝 아래까지 허용해 섬 측면(암반)이 보이게 한다.
        // 완전히 아래로는 못 가게 막아 바닥 면이 드러나지 않도록 한다.
        maxPolarAngle={Math.PI / 1.92}
        // 섬 아래쪽에 여유를 둬 회전할 때 매달린 암반 전체가 화면에 들어오게 한다.
        target={[0, -10, 0]}
      />
    </Canvas>
  )
}
