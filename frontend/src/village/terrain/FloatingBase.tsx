import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import { Color } from 'three'
import { SPAN, seeded } from '../layout'

/**
 * 하늘에 떠 있는 섬의 아랫부분.
 *
 * 지금까지 대지는 두께 없는 plane 이라 옆에서 보면 종이 한 장처럼 보였다.
 * 위에서 보는 지표면은 그대로 두고, 그 아래로 좁아지는 암반을 쌓아 부피를 만든다.
 *
 * 카메라가 수평 아래로는 못 내려가므로(Scene 의 maxPolarAngle) 바닥 면은 보이지 않는다.
 * 실제로 눈에 들어오는 건 **측면 실루엣**이라 거기에 공을 들인다:
 *  - 지표면 바로 아래 살짝 튀어나온 처마(lip) → 절벽 끝처럼 읽힌다
 *  - 층마다 조금씩 좁아지고 살짝 회전 → 깎인 바위 느낌
 *  - 아래로 갈수록 어두워지는 색 → 깊이감
 */

interface Props {
  /** 지표면 y. 이 아래로 암반을 쌓는다. */
  topY: number
  /** 암반 기본색. */
  rock: Color
  /** 처마(지표면 바로 아래 단면) 색 — 흙/풀 층처럼 보이게 조금 다르게 준다. */
  lip: Color
  /** 전체 깊이. 클수록 더 높이 떠 있는 느낌. */
  depth?: number
}

interface Layer {
  size: number
  height: number
  centerY: number
  rotation: number
  offsetX: number
  offsetZ: number
  shade: number
}

export function FloatingBase({ topY, rock, lip, depth = 22 }: Props) {
  const { layers, tip, chunks } = useMemo(() => {
    const rand = seeded(20260728)
    // 아래로 좁아지는 비율. 첫 층부터 확실히 줄여야 "떠 있는 섬"이지 두꺼운 판이 아니다.
    const ratios = [0.93, 0.78, 0.6, 0.43, 0.28, 0.16]
    const built: Layer[] = []

    let y = topY - 0.6
    ratios.forEach((ratio, i) => {
      // 위쪽은 얇고 아래쪽은 두껍게 — 뿌리처럼 길게 내려간다.
      const height = (depth / ratios.length) * (0.6 + i * 0.16)
      built.push({
        size: SPAN * ratio,
        height,
        centerY: y - height / 2,
        // 정렬이 완벽하면 계단처럼 보인다. 몇 도만 틀어 깎인 느낌을 준다.
        rotation: (rand() - 0.5) * 0.22,
        offsetX: (rand() - 0.5) * SPAN * 0.03,
        offsetZ: (rand() - 0.5) * SPAN * 0.03,
        shade: 1 - i * 0.15,
      })
      y -= height
    })

    // 뾰족하게 마무리 — 뭉툭하면 잘린 것처럼 보인다.
    const tipTop = y
    const tipShape = { radius: SPAN * 0.1, height: depth * 0.4, centerY: tipTop - (depth * 0.4) / 2 }

    // 측면 실루엣을 깨는 돌덩이들. 층 경계에 붙여 붕 떠 보이지 않게 한다.
    const rocks: { pos: [number, number, number]; scale: number; rot: number }[] = []
    for (let i = 0; i < 26; i++) {
      const layer = built[Math.floor(rand() * built.length)]
      const edge = (layer.size / 2) * (0.82 + rand() * 0.22)
      const angle = rand() * Math.PI * 2
      rocks.push({
        pos: [
          Math.cos(angle) * edge,
          layer.centerY + (rand() - 0.5) * layer.height * 0.8,
          Math.sin(angle) * edge,
        ],
        scale: 0.5 + rand() * 1.5,
        rot: rand() * Math.PI * 2,
      })
    }

    return { layers: built, tip: tipShape, chunks: rocks }
  }, [topY, depth])

  return (
    <group>
      {/* 처마 — 지표면보다 살짝 넓어 절벽 끝처럼 그림자를 드리운다 */}
      <mesh position={[0, topY - 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[SPAN + 0.7, 0.6, SPAN + 0.7]} />
        <meshStandardMaterial color={lip} roughness={1} flatShading />
      </mesh>

      {layers.map((layer, i) => (
        <mesh
          key={i}
          position={[layer.offsetX, layer.centerY, layer.offsetZ]}
          rotation={[0, layer.rotation, 0]}
          castShadow
        >
          <boxGeometry args={[layer.size, layer.height, layer.size]} />
          <meshStandardMaterial
            color={rock.clone().multiplyScalar(layer.shade)}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}

      <mesh position={[0, tip.centerY, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[tip.radius, tip.height, 6]} />
        <meshStandardMaterial color={rock.clone().multiplyScalar(0.42)} roughness={1} flatShading />
      </mesh>

      <Instances limit={chunks.length} range={chunks.length} castShadow>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={rock.clone().multiplyScalar(0.72)} roughness={1} flatShading />
        {chunks.map((c, i) => (
          <Instance key={i} position={c.pos} rotation={[c.rot, c.rot * 1.7, 0]} scale={c.scale} />
        ))}
      </Instances>
    </group>
  )
}
