import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { Village } from './Village'
import { SKY } from './terrain'
import type { CellOverride } from './GrowableObject'
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
  onSelect: (domainIndex: number) => void
}

/** R3F Canvas + 조명 + OrbitControls. isometric 느낌의 초기 시점. */
export function Scene({ mandalart, selected, overrides, themes, terrain, catalog, onSelect }: Props) {
  const sky = SKY[terrain]

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [31, 28, 31], fov: 40 }}
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
      />

      <Village
        mandalart={mandalart}
        selected={selected}
        overrides={overrides}
        themes={themes}
        terrain={terrain}
        catalog={catalog}
        onSelect={onSelect}
      />

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
