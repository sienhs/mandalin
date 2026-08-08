import type { BackdropId } from '../backdrops'
import type { Terrain } from '../villageApi'
import type { RoadDecal } from './decals'

/**
 * 배경 사진마다 하나씩 붙는 지형.
 *
 * <p><b>왜 지형 4종으로는 부족한가.</b> 마을 받침판(`CardBase`, 한 변 36.4)이 그림의 빈
 * 자리를 거의 그대로 덮으므로, 화면에는 <b>판 위의 지형</b>과 <b>그 바깥 풍경</b>이 맞닿아
 * 놓인다. 사막 그림에 초원 네 종 중 가장 비슷한 '흙길'을 얹으면 흙색은 맞아도 자갈·나무
 * 말뚝·마른 풀이 사하라와 어울리지 않는다. 색뿐 아니라 <b>거기 놓일 만한 물건</b>이
 * 달라야 두 그림이 한 장으로 읽힌다.
 *
 * <p><b>색은 눈대중이 아니라 사진에서 뽑았다.</b> 각 배경을 400px 로 줄여 빈 자리 안쪽과
 * 그 둘레(타원 반경 1.05~1.8배) 픽셀을 따로 모아 최빈색을 냈다. 아래 각 지형 주석의
 * `사진:` 이 그 값이고, 대지·길 색은 거기서 출발했다.
 *
 * <p><b>서버에는 여전히 4종만 저장된다</b>(`base`). 지형 enum 은 백엔드가 검증하므로
 * 늘릴 수 없고, 늘릴 이유도 없다 — 배경 선택은 이미 브라우저에 남고 있고, 블록 바닥색·
 * 하늘처럼 지형에서 파생되는 값들은 `base` 로 계산해도 계열이 맞는다. 여기서 하는 일은
 * <b>그 위에 얹는 겉모습</b>뿐이다.
 */

/** 교차로 열여섯 곳에 세울 소품. */
export type MarkerKind =
  | 'lantern'
  | 'obelisk'
  | 'lamp'
  | 'palm'
  | 'gear'
  | 'post'
  | 'pylon'
  | 'neon'
  | 'none'

interface Common {
  /** 조작 바와 배경 고르기 화면에 보여 줄 이름. */
  name: string
  /** 서버에 저장할 지형. 블록 바닥색·하늘·조명이 이 값에서 나온다. */
  base: Terrain
  /** 받침판 옆면. 판의 두께로 보이는 면이라 배경과 바로 맞닿는다. */
  edge: string
  /**
   * 블록(도메인 9칸) 바닥색. 생략하면 `base` 의 기본색을 쓴다.
   *
   * <p>도시화(진행률)에 따라 광장색으로 당겨지는 규칙은 그대로 적용된다 —
   * 여기서 바꾸는 것은 출발색뿐이다.
   */
  block?: string
}

export interface PavedSkin extends Common {
  kind: 'paved'
  /** 대지(길이 아닌 전부). */
  ground: string
  /** 길 폭 — `GAP` 에 대한 비율. */
  roadRatio: number
  /**
   * 길 겹. 아래에서 위로 쌓인다. 두 겹이면 아래가 넓어 가장자리가 번지고,
   * 한 겹이면 경계가 또렷하다(포장도로).
   */
  road: { widthScale: number; color: string; roughness?: number }[]
  /**
   * 길 위에 얹는 층들. <b>적은 순서가 곧 아래에서 위 순서</b>이고, 높이는
   * {@link ./decals} 의 `RoadDecals` 가 알아서 준다.
   *
   * <p>디테일을 더하고 싶으면 여기에 한 줄 추가하면 된다 — 종류는 `RoadDecal` 에 모여 있고
   * 새 종류를 만드는 것도 거기 세 줄이다. 지형마다 y 를 다시 맞출 일은 없다.
   */
  decals?: readonly RoadDecal[]
  marker: MarkerKind
  /**
   * 소품을 교차로 몇 곳마다 세울지. 기본 1 = 열여섯 곳 전부.
   *
   * <p><b>무거운 소품을 솎는 손잡이다.</b> 소품은 인스턴싱하지 않는 여러 메시 묶음이라
   * 개수가 그대로 draw call 이 된다 — 톱니바퀴(11 메시)를 열여섯 곳에 세우면 176 개로,
   * 기존 도시 지형의 가로등 전체(64)보다 세 배 가까이 든다. 2 로 두면 절반만 서고
   * 격자가 성겨져 오히려 장식처럼 읽힌다.
   */
  markerEvery?: number
}

export interface WaterSkin extends Common {
  kind: 'water'
  /** 수면. */
  surface: string
  /** 수심 표현용 아래 판. */
  deep: string
  /** 수면 재질 — 얼음은 거칠고 바다는 매끈하다. */
  roughness: number
  metalness: number
  /** 블록을 받치는 섬의 윗흙과 물에 잠긴 아래턱. */
  island: string
  islandLip: string
  /** 섬을 잇는 다리. */
  bridge: string
  bridgeRail: string
  /** 수면 위에 뜬 것(수련잎·유빙·거품). */
  float: { color: string; size: number; count: number }
  /** 잔물결 링 색. */
  ripple: string
  /**
   * 받침판 윗면 높이. 물 지형은 반드시 내려야 한다 — 수면(−0.34)과 수심 판(−0.79)이
   * 기본 높이(−0.06)보다 아래라, 그대로 두면 판이 물을 통째로 삼켜 파란 판때기만 남는다.
   * `FloatingBase` 가 물길에만 `topY: -0.85` 를 주는 것과 같은 이유·같은 값이다.
   */
  cardTop: number
}

export type TerrainSkin = PavedSkin | WaterSkin

/**
 * 배경 10종의 지형.
 *
 * <p>순서는 {@link ../backdrops} 의 `BACKDROPS` 와 같다(밝은 것 → 어두운 것).
 */
export const TERRAIN_SKINS: Record<BackdropId, TerrainSkin> = {
  /*
    사진: 빈 자리 #d2c6d6(안개 낀 연못) · 둘레 #fbd6d9(벚꽃)

    둘레가 온통 분홍이라 대지를 그냥 초록으로 두면 판만 도드라진다. 채도를 낮춘 봄 잔디에
    화강암 자갈길을 내고, <b>떨어진 꽃잎</b>을 뿌려 위쪽 벚나무와 색을 잇는다 — 두 그림을
    묶는 것은 결국 이 분홍이다. 교차로에는 석등.
  */
  sakura: {
    kind: 'paved',
    name: '벚꽃 잔디',
    base: 'GRASS_PATH',
    edge: '#c9bfae',
    block: '#a9bd93',
    ground: '#a3b98d',
    roadRatio: 0.54,
    road: [
      { widthScale: 1.5, color: '#bcc4a4' },
      { widthScale: 1, color: '#d6cec1' },
    ],
    decals: [
      // 디딤돌을 먼저 깔고 그 위에 꽃잎이 앉는다 — 순서가 곧 위아래다.
      { type: 'scatter', count: 70, seed: 5150, color: '#e6e0d4', size: 0.13, flat: true, margin: 0.4 },
      { type: 'scatter', count: 240, seed: 3307, color: '#f6c8ca', size: 0.09, flat: true, margin: -0.6 },
      { type: 'scatter', count: 40, seed: 1180, color: '#fbdce2', size: 0.07, margin: -0.4 },
    ],
    marker: 'lantern',
  },

  /*
    사진: 빈 자리 #d5b074 · 둘레 #e3b87b (사하라의 모래와 사암 절벽)

    비포장('흙길')이 가장 가깝지만 그쪽 대지는 거의 검은 흙(`soil`)이라 사막에서 뜬다.
    대지·길을 모두 모래 계열로 올리고 명도차만으로 길을 낸다. 자갈은 사암색으로,
    교차로에는 오벨리스크.
  */
  egypt: {
    kind: 'paved',
    name: '사막 대상로',
    base: 'DIRT_ROAD',
    edge: '#c2a06a',
    block: '#cfae76',
    ground: '#d9b678',
    roadRatio: 0.86,
    road: [{ widthScale: 1, color: '#c19a5f' }],
    decals: [
      { type: 'rut', color: '#ad8850' },
      /*
        바람에 쓸린 모래 결.

        <p>처음에는 `seam` 으로 넣었다가 걷어냈다 — 같은 간격의 곧은 선이 길 폭을 꽉 채우고,
        게다가 길보다 <b>밝아서</b>, 대상로가 2.1 마다 토막 난 것처럼 보였다. 콘크리트
        신축이음이지 모래가 아니었다. 결은 촘촘하고 끊겨 있고 어긋나 있어야 하며,
        색은 길보다 <b>어두워야</b> 한다 — 눈에 보이는 것은 결의 마루가 아니라 골의 그늘이다.
      */
      { type: 'ripple', color: '#b3894f', spacing: 0.58 },
      { type: 'scatter', count: 90, seed: 7, color: '#e0c187', size: 0.16, flat: true, margin: -0.3 },
      { type: 'scatter', count: 200, seed: 91, color: '#b0925f', size: 0.09, margin: -0.3 },
    ],
    marker: 'obelisk',
  },

  /*
    사진: 빈 자리 #999c69(잔디밭) · 둘레 #969a69 + #b7ccd7(한강)

    빈 자리를 순환 도로가 감싸고 그 밖이 도심이다. 잔디 대지에 아스팔트를 얹되
    <b>붉은 자전거 도로</b>를 가장자리에 붙인다 — 한강 둔치를 한 줄로 요약하는 표식이다.
    차선·횡단보도·가로등은 도시 지형과 같은 것을 쓴다.
  */
  seoul: {
    kind: 'paved',
    name: '한강 둔치',
    base: 'CITY_ROAD',
    edge: '#9aa27a',
    block: '#8f9a63',
    ground: '#8f9a63',
    roadRatio: 0.74,
    road: [{ widthScale: 1, color: '#4a4f52', roughness: 0.95 }],
    decals: [
      // 자전거 도로는 교차로 앞에서 끊는다. 실제 도로가 그렇고, 통으로 그으면
      // 교차하는 길 한가운데를 붉은 띠가 가로지른다.
      { type: 'edge', color: '#a8443a', width: 0.34, breakAtCrossings: true },
      // 노란 실선 중앙선 + 흰 점선. 한국 도로를 한 줄로 읽게 하는 표식이다.
      { type: 'center', color: '#d9b83c', width: 0.1, breakAtCrossings: true },
      { type: 'lane', color: '#e6e4dc' },
      { type: 'crosswalk', color: '#e6e4dc' },
    ],
    marker: 'lamp',
  },

  /*
    사진: 빈 자리 #7b7f5f(계단식 논) · 둘레 #798458 + #75989d(바다·물댄 논)

    초록이 지배하되 물기가 돈다. 짙은 초록 대지에 <b>바랜 모래 산책로</b>를 내고, 길가에
    조개·자갈을 흩뿌린다. 교차로에는 야자.
  */
  tropical: {
    kind: 'paved',
    name: '야자 산책로',
    base: 'GRASS_PATH',
    edge: '#7d8a5d',
    block: '#6b8250',
    ground: '#5f7a4a',
    roadRatio: 0.6,
    road: [
      { widthScale: 1.45, color: '#8a9364' },
      { widthScale: 1, color: '#c6b389' },
    ],
    decals: [
      /*
        갈퀴로 고른 자갈 산책로. 여기도 `seam`(널판) 이었는데, 바닥이 널판이 아니라 모래·자갈이라
        같은 문제를 안고 있었다 — 0.9 간격의 곧은 가로줄은 사다리로 보인다.
      */
      { type: 'ripple', color: '#b3a077', spacing: 0.72, seed: 9134 },
      { type: 'scatter', count: 90, seed: 6602, color: '#4f6b3c', size: 0.19, flat: true, margin: -0.6 },
      { type: 'scatter', count: 150, seed: 2211, color: '#a89b7d', size: 0.1, margin: -0.3 },
      { type: 'scatter', count: 45, seed: 3391, color: '#e3d7bd', size: 0.08, margin: 0.3 },
    ],
    marker: 'palm',
    markerEvery: 2,
  },

  /*
    사진: 빈 자리 #bf946b(놋쇠 원반) · 둘레 #392725 · #fcd5a4 (배관과 노을)

    빈 자리 자체가 <b>거대한 놋쇠 기계 상판</b>이라, 여기서만 대지가 흙이 아니라 금속이다.
    어두운 철판 위에 놋쇠 길을 깔고 리벳을 촘촘히 박는다. 교차로에는 톱니바퀴.
  */
  steampunk: {
    kind: 'paved',
    name: '놋쇠 부설로',
    base: 'CITY_ROAD',
    edge: '#5a4038',
    block: '#6d5a4a',
    ground: '#3f332e',
    roadRatio: 0.78,
    road: [
      { widthScale: 1.2, color: '#7d5f38', roughness: 0.6 },
      { widthScale: 1, color: '#a8804a', roughness: 0.45 },
    ],
    decals: [
      // 놋쇠 판을 이어 붙인 자국. 여기는 <b>사람이 깐 판</b>이라 규칙적인 것이 맞다.
      // 다만 원래 색(#6b4f2c)은 놋쇠 대비 휘도차가 50 이라 선이 너무 셌다.
      { type: 'seam', color: '#7e5f34', spacing: 1.15, width: 0.06 },
      // 길 한가운데를 지나는 궤도. 그림 곳곳의 배관·화차와 같은 세계로 묶는다.
      { type: 'ties', tie: '#5c4530', rail: '#cfae74' },
      { type: 'edge', color: '#c69a58', width: 0.12 },
      { type: 'scatter', count: 210, seed: 8123, color: '#8a6a3c', size: 0.07, flat: true, margin: 0.2 },
      { type: 'scatter', count: 60, seed: 442, color: '#4a3a30', size: 0.14, margin: -0.3 },
    ],
    marker: 'gear',
    markerEvery: 2,
  },

  /*
    사진: 빈 자리 #144e78(칼데라 깊은 물) · 둘레 #0d5885

    빈 자리가 통째로 바다다. 물길 지형과 구조는 같지만 <b>섬이 흰 회벽</b>이고 다리도
    나무가 아니라 흰 돌이다 — 절벽 위 흰 마을과 같은 재료여야 한 마을로 보인다.
  */
  santorini: {
    kind: 'water',
    name: '에게해 수로',
    base: 'WATER_WAY',
    edge: '#d8d0c1',
    block: '#dcd6c8',
    surface: '#14588a',
    deep: '#0a3557',
    roughness: 0.16,
    metalness: 0.4,
    island: '#e8e3d8',
    islandLip: '#c4bba9',
    bridge: '#ded7c9',
    bridgeRail: '#b9b0a0',
    float: { color: '#eef0ea', size: 0.22, count: 46 },
    ripple: '#ffffff',
    cardTop: -0.85,
  },

  /*
    사진: 빈 자리 #9e774b · 둘레 #664938 (광산 계곡의 맨흙과 철길)

    비포장과 같은 계열이되 <b>붉은 흙</b>이고 훨씬 어둡다. 바퀴자국을 깊게 파고 자갈을
    거칠게 뿌린다. 교차로에는 나무 말뚝.
  */
  western: {
    kind: 'paved',
    name: '개척지 흙길',
    base: 'DIRT_ROAD',
    edge: '#6b503a',
    block: '#8a6844',
    ground: '#7a5c3e',
    roadRatio: 0.86,
    road: [{ widthScale: 1, color: '#a87f52' }],
    decals: [
      { type: 'rut', color: '#6f5232' },
      // 광산 궤도. 사진의 계곡을 가로지르는 철길과 같은 것이다.
      { type: 'ties', tie: '#5a4229', rail: '#8e7f6b' },
      { type: 'scatter', count: 40, seed: 9021, color: '#9a8464', size: 0.18, flat: true, margin: 0.3 },
      { type: 'scatter', count: 220, seed: 5501, color: '#7a6650', size: 0.1, margin: -0.3 },
      { type: 'scatter', count: 80, seed: 118, color: '#5c4636', size: 0.14, margin: -0.3 },
    ],
    marker: 'post',
  },

  /*
    사진: 빈 자리 #c6d1df(눈밭) · 둘레 #264569(피오르의 검푸른 바다)

    구조는 물길이지만 물이 <b>언 채로 멈춰 있다</b> — 수면을 창백한 청회색으로 올리고
    거칠게(roughness 0.55) 만들어 반사를 죽인다. 섬은 눈, 다리는 짙은 나무, 물 위에는
    수련 대신 유빙이 뜬다.
  */
  nordic: {
    kind: 'water',
    name: '설원 빙로',
    base: 'WATER_WAY',
    edge: '#c4d0dd',
    block: '#dfe8f1',
    surface: '#8fb0c9',
    deep: '#2c4a6e',
    roughness: 0.55,
    metalness: 0.15,
    island: '#e6edf5',
    islandLip: '#a9bccd',
    bridge: '#5a4636',
    bridgeRail: '#43352a',
    float: { color: '#f2f7fb', size: 0.3, count: 60 },
    ripple: '#dff0ff',
    cardTop: -0.85,
  },

  /*
    사진: 빈 자리 #808ca2(금속 상판) · 둘레 #295584(항만)

    빈 자리가 원형 금속 플랫폼이다. 대지를 강철로 두고 통로에 <b>청록 유도등</b>을 흘린다.
    도시 지형과 형태는 같지만 흰 페인트 대신 빛으로 선을 긋는다. 교차로에는 발광 기둥.
  */
  sf: {
    kind: 'paved',
    name: '부양 플랫폼',
    base: 'CITY_ROAD',
    edge: '#4d566a',
    block: '#69738a',
    ground: '#5c6577',
    roadRatio: 0.74,
    road: [{ widthScale: 1, color: '#3a4252', roughness: 0.45 }],
    decals: [
      // 데크 패널 이음매. 금속 상판이라는 사실을 이 줄 하나가 말해 준다.
      { type: 'seam', color: '#2b3140', spacing: 1.3, width: 0.05 },
      // 유도등은 끊지 않는다 — 격자로 이어져야 통로망으로 읽힌다.
      { type: 'edge', color: '#4fd8e8', width: 0.08, emissive: 1.5 },
      { type: 'lane', color: '#9ceef6', emissive: 0.9 },
      { type: 'scatter', count: 70, seed: 771, color: '#78849b', size: 0.08, flat: true, margin: 0.3 },
    ],
    marker: 'pylon',
  },

  /*
    사진: 빈 자리 #575c7b · 둘레 #17132b (거의 검은 야경)

    가장 어둡다. 대지를 남보라로, 길을 거의 검게 깔고 <b>마젠타 가장자리 + 시안 점선</b>으로만
    형태를 읽게 한다. 밝은 소품을 얹으면 야경이 깨지므로 산포물은 두지 않는다.
  */
  cyberpunk: {
    kind: 'paved',
    name: '네온 격자',
    base: 'CITY_ROAD',
    edge: '#1b1730',
    block: '#332c4d',
    ground: '#241f38',
    roadRatio: 0.74,
    road: [{ widthScale: 1, color: '#14111f', roughness: 0.5 }],
    decals: [
      { type: 'seam', color: '#0d0b16', spacing: 1.6, width: 0.06 },
      { type: 'edge', color: '#ff3fa4', width: 0.07, emissive: 1.8 },
      { type: 'lane', color: '#39e6ff', emissive: 1.4 },
    ],
    marker: 'neon',
  },
}

/** 배경 key 로 지형을 찾는다. 배경이 없거나 모르는 key 면 null — 그때는 기존 4종을 쓴다. */
export function findTerrainSkin(key: string | null | undefined): TerrainSkin | null {
  if (!key) return null
  return (TERRAIN_SKINS as Record<string, TerrainSkin>)[key] ?? null
}
