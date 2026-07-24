import { Canvas } from '@react-three/fiber'
import { Bounds, Center } from '@react-three/drei'
import { StageBuilding } from './buildings'
import type { BuildingKey, Stage, ThemeKey } from './catalog'

interface Props {
  k: BuildingKey
  stage?: Stage
  theme?: ThemeKey
  size?: number
  /** 캡처용: 내부 <canvas> DOM 요소를 넘겨줌 (toDataURL로 PNG 추출). */
  onCanvas?: (el: HTMLCanvasElement) => void
}

/**
 * 건물 1개를 독립 Canvas에 렌더하는 썸네일.
 * - 상점 카드의 라이브 프리뷰로도, 정적 PNG 캡처(스튜디오)용으로도 재사용.
 * - Bounds가 건물 크기에 맞춰 카메라를 자동 프레이밍(오두막~마천루 모두 딱 맞게).
 * - gl.preserveDrawingBuffer=true 라서 언제든 domElement.toDataURL() 캡처 가능.
 * - 배경 alpha:true(투명) → 카드 배경 위에 자연스럽게 얹힘.
 */
export function BuildingThumbnail({ k, stage = 3, theme = 'warm', size = 140, onCanvas }: Props) {
  return (
    <Canvas
      style={{ width: size, height: size }}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      camera={{ position: [3, 2.2, 3], fov: 32 }}
      onCreated={({ gl }) => onCanvas?.(gl.domElement)}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Bounds fit clip observe margin={1.15}>
        <Center>
          {/* ref 단위를 적당히 키워서 프레이밍(Bounds가 최종 맞춤). */}
          <group scale={2.4}>
            <StageBuilding k={k} stage={stage} theme={theme} />
          </group>
        </Center>
      </Bounds>
    </Canvas>
  )
}
