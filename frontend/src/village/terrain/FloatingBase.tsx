import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import { Color } from 'three'
import { SPAN, seeded } from '../layout'

/**
 * 하늘에 떠 있는 섬의 아랫부분.
 *
 * 위에서 보는 지표면은 그대로 두고, 그 아래로 부피를 만든다.
 * 카메라가 수평 아래로는 못 내려가므로(Scene 의 maxPolarAngle) 바닥 면은 보이지 않고
 * 실제로 눈에 들어오는 건 **측면 실루엣**이다. 그래서 거기에만 공을 들인다.
 *
 * 예전 구현은 아래로 좁아지는 사각 층을 쌓아 "계단 피라미드"가 됐다. 레퍼런스(마인크래프트
 * 하늘섬)의 아랫면은 그게 아니라 **길이가 저마다 다른 수직 기둥이 매달린 다발**이다.
 * 그래서 층 쌓기를 버리고 격자마다 기둥을 하나씩 내려뜨린다:
 *  - 기둥 길이 = 중심에서 멀수록 짧아짐 × 저주파 흔들림(덩어리가 여러 갈래로 갈라짐)
 *    × 칸별 난수(들쭉날쭉한 실루엣)
 *  - 기둥 하나를 3단으로 끊고 아래로 갈수록 좁혀 종유석처럼 뾰족해지게 한다
 *  - 칸 크기보다 조금 좁게 만들어 기둥 사이에 어두운 틈(그림자 선)이 생기게 한다
 *  - 아래로 갈수록 어두운 색 → 깊이감
 *  - 일부 기둥 아래로 아주 가늘고 긴 침 → 레퍼런스의 늘어진 실 같은 선
 */

interface Props {
  /** 지표면 y. 이 아래로 암반을 매단다. */
  topY: number
  /** 암반 기본색. */
  rock: Color
  /** 처마(지표면 바로 아래 단면) 색 — 흙/풀 층처럼 보이게 조금 다르게 준다. */
  lip: Color
  /** 기둥 최대 길이. 클수록 더 높이 떠 있는 느낌. */
  depth?: number
}

/** 기둥 한 토막. 단위 박스를 비균등 스케일 + 인스턴스별 색으로 찍는다. */
interface Chunk {
  pos: [number, number, number]
  scale: [number, number, number]
  color: Color
}

/** 한 변에 놓을 기둥 수. 늘리면 실루엣이 촘촘해지고 인스턴스 수가 제곱으로 늘어난다. */
const GRID = 18

/** 지표면 바로 아래 통짜 슬래브 두께. 기둥 사이 틈으로 하늘이 비치는 걸 막는다. */
const CAP = 1.3

/** 슬래브 아래 한 겹 더. 지각이 한 겹이면 판에서 갑자기 기둥이 튀어나온 것처럼 끊긴다. */
const CRUST = 1.5

/** 기둥 맨 위 흙층 두께 상한. 이걸 넘기면 갈색 띠가 두꺼워져 상자 뚜껑처럼 읽힌다. */
const BAND = 1.8

/** 흙층 아래 기둥을 끊는 단. width 는 칸 대비 폭, span 은 남은 길이 대비 비율. */
const TIERS = [
  { width: 1.0, span: 0.26 },
  { width: 0.76, span: 0.3 },
  { width: 0.5, span: 0.44 },
]

/**
 * 저주파 값 노이즈. 칸마다 독립 난수를 쓰면 기둥이 하나씩 따로 놀아 빗처럼 보인다.
 * 굵은 격자(LATTICE)에 난수를 깔고 부드럽게 보간해, 인접한 기둥들이 같이 길어지며
 * 레퍼런스처럼 덩어리(로브) 몇 개로 뭉치게 만든다.
 */
const LATTICE = 5

function lobeField(rand: () => number): (u: number, v: number) => number {
  const grid: number[][] = []
  for (let i = 0; i <= LATTICE; i++) {
    grid[i] = []
    for (let j = 0; j <= LATTICE; j++) grid[i][j] = rand()
  }
  const smooth = (t: number) => t * t * (3 - 2 * t)
  return (u, v) => {
    const fx = Math.min(0.999, Math.max(0, u)) * LATTICE
    const fz = Math.min(0.999, Math.max(0, v)) * LATTICE
    const i = Math.floor(fx)
    const j = Math.floor(fz)
    const sx = smooth(fx - i)
    const sz = smooth(fz - j)
    const a = grid[i][j] + (grid[i + 1][j] - grid[i][j]) * sx
    const b = grid[i][j + 1] + (grid[i + 1][j + 1] - grid[i][j + 1]) * sx
    return a + (b - a) * sz
  }
}

export function FloatingBase({ topY, rock, lip, depth = 22 }: Props) {
  const { chunks, needles, crustY } = useMemo(() => {
    const rand = seeded(20260729)
    const cell = SPAN / GRID
    const field = lobeField(rand)
    const crustBottom = topY - CAP - CRUST
    const body: Chunk[] = []
    const spikes: Chunk[] = []

    // 지표면 바로 아래는 흙층처럼 밝고, 내려갈수록 어두워진다.
    const soil = rock.clone().lerp(lip, 0.55)
    const shadeAt = (y: number) => 1 - 0.62 * Math.min(1, (crustBottom - y) / depth)

    for (let ix = 0; ix < GRID; ix++) {
      for (let iz = 0; iz < GRID; iz++) {
        // 격자에 딱 맞추면 기둥이 줄지어 정렬돼 인공적인 바둑판으로 읽힌다. 조금씩 흔든다.
        const x = -SPAN / 2 + cell * (ix + 0.5) + (rand() - 0.5) * cell * 0.4
        const z = -SPAN / 2 + cell * (iz + 0.5) + (rand() - 0.5) * cell * 0.4

        // 중심으로 갈수록 점점 길어진다. r 의 제곱이 아니라 r 자체로 떨어뜨리는 게 핵심 —
        // (1-r²) 계열은 내부 절반이 거의 평평해서(r=0.5 에서도 0.67) 중앙이 뭉툭한 고원이
        // 된다. (1-r)^1.45 는 r=0.5 에서 0.37 까지 떨어져 가장자리→중앙이 매끄럽게
        // 길어지는 원뿔형 그라데이션이 나온다.
        const r = Math.min(1, Math.hypot(x, z) / (SPAN * 0.78))
        const taper = Math.pow(1 - r, 1.45)
        // 로브(덩어리) — 이웃 칸끼리 같이 길어진다. 폭이 넓으면 반경 그라데이션을 덮어버려
        // "중앙이 길다"가 안 읽히므로 좁게 준다.
        const lobe = 0.68 + 0.32 * field(ix / GRID, iz / GRID)
        // 칸별 흔들림 — 같은 로브 안에서도 끝이 들쭉날쭉해진다.
        const jag = 0.7 + rand() * 0.3
        const mottle = 0.86 + rand() * 0.26
        // 기둥 굵기도 칸마다 다르게. 전부 같은 폭이면 골판지처럼 균일한 줄무늬가 된다.
        // 1.0 에 가까운 칸은 이웃과 맞닿아 굵은 덩어리로 뭉친다.
        const girth = cell * (0.68 + rand() * 0.32)
        // 모서리까지 두르는 최소 길이. 이게 없으면 taper 가 0 인 네 모서리에서 지각의
        // 수직 단면이 그대로 드러나 상자 옆면처럼 보인다.
        const skirt = depth * 0.1 * (0.7 + 0.5 * jag)
        const total = Math.max(skirt, depth * taper * lobe * jag)

        let y = crustBottom
        // 흙층 — 기둥 길이와 무관하게 얇게 유지해 지표면 아래 한 줄로만 읽히게 한다.
        const bandH = Math.min(BAND, total * 0.4)
        body.push({
          pos: [x, y - bandH / 2, z],
          scale: [girth, bandH, girth],
          color: soil.clone().multiplyScalar(mottle),
        })
        y -= bandH

        const rest = total - bandH
        TIERS.forEach((tier) => {
          const h = rest * tier.span
          const w = girth * tier.width
          const cy = y - h / 2
          body.push({
            pos: [x, cy, z],
            scale: [w, h, w],
            color: rock.clone().multiplyScalar(shadeAt(cy) * mottle),
          })
          y -= h
        })

        // 뾰족하게 늘어진 침. 이미 긴 기둥 아래에만 붙여 허공에 떠 보이지 않게 한다.
        if (rand() < 0.16 && total > depth * 0.3) {
          const h = total * (0.12 + rand() * 0.2)
          const w = cell * (0.16 + rand() * 0.18)
          spikes.push({
            pos: [x, y - h / 2, z],
            scale: [w, h, w],
            color: rock.clone().multiplyScalar(0.4),
          })
        }
      }
    }

    return { chunks: body, needles: spikes, crustY: topY - CAP - CRUST / 2 }
  }, [topY, rock, lip, depth])

  return (
    <group>
      {/* 처마 — 지표면보다 살짝 넓어 절벽 끝처럼 그림자를 드리운다 */}
      <mesh position={[0, topY - CAP / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[SPAN + 0.8, CAP, SPAN + 0.8]} />
        <meshStandardMaterial color={lip} roughness={1} flatShading />
      </mesh>

      {/* 지각 두 번째 겹 — 처마보다 살짝 좁혀 한 단 들어간 절벽면을 만든다 */}
      <mesh position={[0, crustY, 0]} castShadow>
        <boxGeometry args={[SPAN - 0.6, CRUST, SPAN - 0.6]} />
        <meshStandardMaterial
          color={rock.clone().lerp(lip, 0.22)}
          roughness={1}
          flatShading
        />
      </mesh>

      <Instances limit={chunks.length} range={chunks.length} castShadow>
        <boxGeometry />
        <meshStandardMaterial roughness={1} flatShading />
        {chunks.map((c, i) => (
          <Instance key={i} position={c.pos} scale={c.scale} color={c.color} />
        ))}
      </Instances>

      {needles.length > 0 && (
        <Instances limit={needles.length} range={needles.length}>
          <boxGeometry />
          <meshStandardMaterial roughness={1} flatShading />
          {needles.map((c, i) => (
            <Instance key={i} position={c.pos} scale={c.scale} color={c.color} />
          ))}
        </Instances>
      )}
    </group>
  )
}
