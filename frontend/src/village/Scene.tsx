import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Village } from './Village'
import { SKY } from './terrain'
import { IsoCamera, type IsoCameraHandle, type ZoomLevel } from './IsoCamera'
import { SkyBackdrop, skyClearColor } from './SkyBackdrop'
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
  /**
   * 섬 아랫부분(매달린 암반·종유석)을 그릴지. **기본 false.**
   *
   * 1,296개 인스턴스가 그림자까지 드리우는 가장 무거운 장식이고, 판타지 톤이라
   * 2D 화면의 담백한 카드와 어울리지 않는다. 기본은 얇은 받침(FloatingBase 없이)이고,
   * 예전 모습이 필요한 화면(갤러리·썸네일 굽기)에서만 켠다.
   */
  islandBase?: boolean
  /** 그림자를 그릴지. 기본 true. 끄면 그림자맵 패스(2048²)가 사라진다. */
  shadows?: boolean
  /**
   * 디테일 부품(창문틀·열주·발코니·옥탑 설비·간판 등)을 그릴지. 기본 true.
   *
   * 완성 단계(진행률 75% 이상)에서 draw call 이 517 → 1,016 으로 뛰는데 그 증가분의 대부분이
   * 이 부품들이다(끄면 607). 삼각형 수는 15만개로 문제가 아니고, draw call 과 mesh 마다
   * 새로 만들어지는 geometry(1,007개)가 병목이다.
   */
  details?: boolean
  /**
   * 카메라 조작 통로. 회전·줌 버튼을 Canvas 밖(HTML)에 그리려면 필요하다.
   * `useIsoCamera()` 가 돌려주는 ref 를 그대로 넘긴다.
   */
  cameraRef?: React.Ref<IsoCameraHandle>
  initialZoom?: ZoomLevel
  onFacingChange?: (facing: number) => void
  /** 카메라가 바라볼 지점. 생략하면 마을 중심. */
  focus?: [number, number, number]
  /**
   * 캔버스 안에 추가로 렌더할 것. 실서비스에서는 쓰지 않는다.
   *
   * 렌더 통계(draw call 수)는 `useThree` 로 renderer 에 닿아야 읽을 수 있는데, 그 훅은
   * Canvas 안에서만 동작한다. 테스트 화면이 계측기를 꽂을 자리를 열어 두는 것 — 대신
   * 공용 컴포넌트에 진단 코드를 심지 않는다.
   */
  children?: ReactNode
  onSelect: (domainIndex: number) => void
  onSelectTask: (taskId: string) => void
}

/**
 * R3F Canvas + 조명 + 아이소메트릭 카메라.
 *
 * <p>투영을 직교로 바꾸고 회전을 90° 스냅으로 묶었다. 2D 만다라트 격자와 같은 평행 투영을
 * 쓰기 위해서다 — 자세한 이유는 {@link IsoCamera} 주석에 적었다.
 */
export function Scene({
  mandalart,
  selected,
  overrides,
  themes,
  terrain,
  catalog,
  selectedTaskId,
  landmark,
  islandBase = false,
  shadows = true,
  details = true,
  cameraRef,
  initialZoom = 1,
  onFacingChange,
  focus,
  children,
  onSelect,
  onSelectTask,
}: Props) {
  const sky = SKY[terrain]

  return (
    <Canvas
      shadows={shadows}
      gl={{ preserveDrawingBuffer: true }}
      onPointerMissed={() => onSelect(-1)}
      /*
        끌어서 돌릴 수 있다는 걸 커서로 알린다. touchAction 을 끄지 않으면 모바일에서
        가로로 끌 때 브라우저가 페이지 스크롤로 가로채 회전이 먹히지 않는다.
      */
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      <color attach="background" args={[skyClearColor(terrain)]} />
      <SkyBackdrop terrain={terrain} />

      <IsoCamera
        handleRef={cameraRef}
        initialZoom={initialZoom}
        onFacingChange={onFacingChange}
        focus={focus}
      />

      {/*
        조명을 평평하게 간다.

        예전 값(ambient 0.6 / directional 1.6)은 그림자가 진하고 대비가 커서 사진처럼 보였다.
        2D 화면은 미세한 그림자와 얇은 테두리로 깊이를 표현하므로, 여기서도 대비를 낮추고
        그림자를 흐리게 해 같은 톤을 만든다. 형태는 여전히 읽히되 덜 극적이다.
      */}
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#ffffff', '#d8d2c6', 0.35]} />
      <directionalLight
        position={sky.sun}
        intensity={1.1}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-46}
        shadow-camera-right={46}
        shadow-camera-top={46}
        shadow-camera-bottom={-46}
        shadow-camera-near={-120}
        shadow-camera-far={260}
        // 직교 카메라에서는 그림자 경계가 딱 떨어져 더 날카로워 보인다. 살짝 흐려 둔다.
        shadow-radius={3}
        shadow-bias={-0.0008}
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
          islandBase={islandBase}
          details={details}
          onSelect={onSelect}
          onSelectTask={onSelectTask}
        />
      </Suspense>

      {children}
    </Canvas>
  )
}
