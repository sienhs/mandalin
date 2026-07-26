import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { Village } from './Village'
import type { CellOverride } from './GrowableObject'
import type { ThemeKey } from './catalog'
import type { Mandalart } from './types'

interface Props {
  mandalart: Mandalart
  selected: number | null
  overrides: Record<string, CellOverride>
  themes: Record<string, ThemeKey>
  onSelect: (domainIndex: number) => void
}

/** R3F Canvas + 조명 + OrbitControls. isometric 느낌의 초기 시점. */
export function Scene({ mandalart, selected, overrides, themes, onSelect }: Props) {
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [31, 28, 31], fov: 40 }}
      onPointerMissed={() => onSelect(-1)}
    >
      <color attach="background" args={['#cfe8f0']} />
      <Sky sunPosition={[20, 30, 10]} turbidity={6} rayleigh={1.2} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <Village mandalart={mandalart} selected={selected} overrides={overrides} themes={themes} onSelect={onSelect} />

      <OrbitControls
        makeDefault
        enablePan
        minDistance={10}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
