import {
  CrossBars,
  Crosswalks,
  EdgeLines,
  LaneDashes,
  LineStrips,
  STRIP_LIFT,
  ScatterProps,
  WheelRuts,
} from './common'

/**
 * 길 위에 얹는 얇은 층들 — <b>지형에 디테일을 더하는 자리</b>.
 *
 * <p><b>왜 목록인가.</b> 예전에는 지형 설정에 `rut` · `edgeLine` · `lane` 같은 칸이 하나씩
 * 있었고, 렌더러가 그것들을 `topY + STRIP_LIFT * 3`, `* 5`, `* 6` 처럼 <b>손으로 고른 층
 * 번호</b>에 얹었다. 그러면 디테일을 하나 더 넣을 때마다 (1) 설정 타입에 칸을 파고
 * (2) 렌더러에 분기를 넣고 (3) 아직 안 쓰인 층 번호를 눈으로 찾아야 했다. 셋 중 마지막이
 * 특히 나쁘다 — 틀려도 조용히 깜빡일 뿐이라 화면을 봐야 안다.
 *
 * <p>지금은 <b>배열 순서가 곧 위아래 순서</b>다. 층 번호는 {@link RoadDecals} 가 각 종류가
 * 몇 겹을 쓰는지(`DECAL_STEPS`) 보고 자동으로 준다. 새 디테일을 더하려면 아래 union 에
 * 한 줄, `DECAL_STEPS` 에 한 줄, 스위치에 한 갈래를 넣으면 되고 <b>높이는 건드리지 않는다</b>.
 *
 * <p>순서는 실제로 칠하는 순서대로 적는 것이 읽기 좋다 — 바닥에 가까운 것(바퀴자국·이음매)
 * 부터, 그 위에 선, 맨 위에 흩뿌린 것.
 */
export type RoadDecal =
  /** 바퀴자국 두 줄. 수레가 지난 자리라 교차로에서도 끊기지 않는다. */
  | { type: 'rut'; color: string; width?: number }
  /**
   * 포장 이음매 — 길을 가로지르는 얇은 줄. <b>사람이 깐 판의 경계</b>다.
   *
   * <p>같은 간격의 곧은 선이라는 점이 이것의 전부다. 흙·모래처럼 자연히 생긴 무늬에 쓰면
   * 길이 토막 난 것처럼 보인다 — 그쪽은 `ripple` 이다.
   */
  | { type: 'seam'; color: string; spacing?: number; width?: number; lengthScale?: number }
  /**
   * 결 — 모래 물결·마른 갈라짐처럼 <b>자연히 생긴 가로 무늬</b>.
   *
   * <p>`seam` 과 그리는 것은 같고 <b>흐트러뜨린다</b>. 촘촘하고, 토막 나 있고, 좌우로
   * 어긋나고, 조금씩 기울어 있다. 대비도 낮게 준다 — 결은 무늬지 경계가 아니다.
   */
  | {
      type: 'ripple'
      color: string
      spacing?: number
      width?: number
      lengthScale?: number
      /** 토막 개수. 낮추면 결이 길어져 다시 선처럼 보인다. */
      pieces?: number
      seed?: number
    }
  /** 궤도 — 침목(가로) + 레일 두 줄(세로). 철길이 지나는 지형에. */
  | { type: 'ties'; tie: string; rail: string; spacing?: number }
  /** 길 가장자리 두 줄. 자전거 도로·발광 라인. */
  | {
      type: 'edge'
      color: string
      width?: number
      inset?: number
      emissive?: number
      /** 교차로에서 끊을지. 실제 도로의 자전거 도로·정지선이 그렇다. */
      breakAtCrossings?: boolean
    }
  /** 중앙선(실선). 점선은 `lane` 이다. */
  | { type: 'center'; color: string; width?: number; emissive?: number; breakAtCrossings?: boolean }
  /** 중앙 점선. */
  | { type: 'lane'; color: string; emissive?: number }
  /** 교차로 네 방향 횡단보도. */
  | { type: 'crosswalk'; color: string }
  /** 길 위 산포물(자갈·꽃잎·리벳). */
  | {
      type: 'scatter'
      count: number
      seed: number
      color: string
      size: number
      flat?: boolean
      margin?: number
    }

/**
 * 종류마다 쓰는 층 수.
 *
 * <p>한 겹 = `STRIP_LIFT * 2`. 가로·세로가 교차점에서 겹치므로 대부분 한 겹 안에서
 * `y` 와 `y + STRIP_LIFT` 두 면을 쓴다({@link ./common} 의 `STRIP_LIFT` 주석). `ties` 만
 * 침목과 레일을 따로 얹어야 해서 두 겹이다.
 */
const DECAL_STEPS: Record<RoadDecal['type'], number> = {
  rut: 1,
  seam: 1,
  ripple: 1,
  ties: 2,
  edge: 1,
  center: 1,
  lane: 1,
  crosswalk: 1,
  scatter: 1,
}

/** 한 겹의 두께. */
const STEP = STRIP_LIFT * 2

function Decal({
  decal,
  roadWidth,
  y,
}: {
  decal: RoadDecal
  roadWidth: number
  y: number
}) {
  switch (decal.type) {
    case 'rut':
      return <WheelRuts roadWidth={roadWidth} color={decal.color} y={y} width={decal.width} />

    case 'seam':
      return (
        <CrossBars
          roadWidth={roadWidth}
          y={y}
          color={decal.color}
          spacing={decal.spacing ?? 1.4}
          width={decal.width ?? 0.05}
          lengthScale={decal.lengthScale ?? 0.94}
        />
      )

    case 'ripple':
      /*
        `seam` 과 같은 것을 그리되 규칙성을 전부 지운다.

        <p>기본값은 사막에서 맞춰 잡았다 — 간격 0.6(길 하나에 58 줄), 세 토막으로 끊고,
        길이를 최대 45% 까지 줄이고, 좌우로 어긋내고, ±0.2rad 안에서 기울인다. 어느 하나를
        빼도 규칙이 도로 드러난다. 특히 `pieces` 를 1 로 두면 나머지를 아무리 흔들어도
        길을 가로지르는 선으로 보인다.
      */
      return (
        <CrossBars
          roadWidth={roadWidth}
          y={y}
          color={decal.color}
          spacing={decal.spacing ?? 0.6}
          width={decal.width ?? 0.055}
          lengthScale={decal.lengthScale ?? 0.82}
          roughness={1}
          jitter={{
            seed: decal.seed ?? 4801,
            pieces: decal.pieces ?? 3,
            along: 0.75,
            across: 0.9,
            length: 0.45,
            tilt: 0.2,
          }}
        />
      )

    case 'ties':
      return (
        <>
          <CrossBars
            roadWidth={roadWidth}
            y={y}
            color={decal.tie}
            spacing={decal.spacing ?? 0.62}
            width={0.16}
            lengthScale={0.66}
            roughness={1}
          />
          {/* 레일은 침목 위에 얹힌다. 침목 길이의 절반쯤 되는 자리에 두 줄. */}
          <LineStrips
            y={y + STEP}
            width={0.07}
            color={decal.rail}
            offsets={[-roadWidth * 0.165, roadWidth * 0.165]}
            roughness={0.35}
          />
        </>
      )

    case 'edge':
      return (
        <EdgeLines
          roadWidth={roadWidth}
          color={decal.color}
          y={y}
          width={decal.width}
          inset={decal.inset}
          emissive={decal.emissive}
          breakAt={decal.breakAtCrossings ? roadWidth / 2 + 0.5 : 0}
        />
      )

    case 'center':
      return (
        <LineStrips
          y={y}
          width={decal.width ?? 0.11}
          color={decal.color}
          offsets={[0]}
          emissive={decal.emissive}
          roughness={0.75}
          breakAt={decal.breakAtCrossings ? roadWidth / 2 + 0.5 : 0}
        />
      )

    case 'lane':
      return (
        <LaneDashes
          roadWidth={roadWidth}
          color={decal.color}
          emissive={decal.emissive}
          y={y}
        />
      )

    case 'crosswalk':
      return <Crosswalks roadWidth={roadWidth} color={decal.color} y={y} />

    case 'scatter':
      return (
        <ScatterProps
          count={decal.count}
          seed={decal.seed}
          color={decal.color}
          size={decal.size}
          flat={decal.flat}
          margin={decal.margin}
          y={y}
        />
      )
  }
}

/**
 * 데칼 목록을 순서대로 쌓는다.
 *
 * <p>층 높이는 여기서만 정해진다 — 부르는 쪽도, 설정표도 y 를 모른다.
 * 그래서 목록을 재배열하거나 중간에 하나를 끼워 넣어도 겹치는 일이 없다.
 */
export function RoadDecals({
  items,
  roadWidth,
  base,
}: {
  items: readonly RoadDecal[]
  roadWidth: number
  /** 가장 아래 데칼이 앉을 높이. 보통 마지막 길 겹의 윗면. */
  base: number
}) {
  let step = 0
  return (
    <group>
      {items.map((decal, i) => {
        const y = base + STEP + step * STEP
        step += DECAL_STEPS[decal.type]
        return <Decal key={`${decal.type}-${i}`} decal={decal} roadWidth={roadWidth} y={y} />
      })}
    </group>
  )
}
