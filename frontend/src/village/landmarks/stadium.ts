import type { BuildingConfig } from '../partTypes'
import { at, archRing, around, podium } from './_helpers'

/**
 * 랜드마크 — 경기장 계열 (3×3, 8단계).
 *
 * 모티브: 월드컵 경기장(타원 보울 + 개폐식 지붕 + 조명탑), 원형 대투기장(콜로세움).
 * 두 종 모두 실루엣의 핵심이 "가운데가 뚫린 링"이라 ring/bowl/arch 부품을 쓴다.
 */

const TURF = '#3E7A43'
const TURF_DARK = '#33683A'
const CONC = '#CFCabb'
const CONC2 = '#B7B1A2'
const SEAT_A = '#2F6FA8'
const SEAT_B = '#D24B3E'
const ROOF_W = '#E9E6DE'
const STEEL = '#8C949B'
const TRAVERTINE = '#D8C9A6'
const TRAVERTINE2 = '#C4B291'
const SAND = '#C9A96B'
const RUIN = '#B5A484'

export const STADIUM_LANDMARKS = {
  /** 1. 월드컵 대경기장 — 타원 보울 + 개폐식 지붕 + 조명탑 4기 */
  lm_worldcup_stadium: {
    label: '월드컵 대경기장',
    group: 'landmark',
    parts: [
      // 1단계 — 부지 정지 + 필드
      ...at(1, [
        { k: 'box', w: 2.96, h: 0.06, d: 2.96, y: 0, color: CONC2, rough: 0.95 },
        { k: 'box', w: 1.66, h: 0.02, d: 1.16, y: 0.06, color: TURF, rough: 1 },
        { k: 'box', w: 1.5, h: 0.012, d: 1.0, y: 0.08, color: TURF_DARK, rough: 1 },
      ]),
      // 2단계 — 하부 콘크리트 링(내부 관중석 기초)
      ...at(2, [
        { k: 'ring', ro: 1.44, ri: 0.98, h: 0.3, y: 0.06, sx: 1, sz: 0.76, seg: 32, color: CONC },
      ]),
      // 3단계 — 1층 관중석 경사
      ...at(3, [
        { k: 'bowl', ro: 1.4, ri: 0.92, h: 0.34, y: 0.34, sx: 1, sz: 0.76, seg: 32, color: SEAT_A },
      ]),
      // 4단계 — 2층 링 + 외벽
      ...at(4, [
        { k: 'ring', ro: 1.46, ri: 1.3, h: 0.62, y: 0.36, sx: 1, sz: 0.76, seg: 32, color: CONC },
        { k: 'bowl', ro: 1.34, ri: 0.96, h: 0.3, y: 0.7, sx: 1, sz: 0.76, seg: 32, color: SEAT_B },
      ]),
      // 5단계 — 상단 링 + 외주 기둥
      ...at(5, [
        { k: 'ring', ro: 1.48, ri: 1.32, h: 0.34, y: 0.98, sx: 1, sz: 0.76, seg: 32, color: CONC2 },
        ...around(16, 1.42, 1.08, (x, z) => ({
          k: 'box', w: 0.1, h: 1.3, d: 0.1, x, z, y: 0.06, color: STEEL, rough: 0.5, metal: 0.4,
        })),
      ]),
      // 6단계 — 개폐식 지붕(안쪽으로 뻗은 캔틸레버) + 유리 파사드
      ...at(6, [
        { k: 'ring', ro: 1.5, ri: 0.86, h: 0.09, y: 1.32, sx: 1, sz: 0.76, seg: 32, color: ROOF_W },
        { k: 'ring', ro: 1.5, ri: 1.42, h: 0.14, y: 1.41, sx: 1, sz: 0.76, seg: 32, color: STEEL },
        ...around(24, 1.41, 1.07, (x, z) => ({
          k: 'panel', w: 0.16, h: 0.5, pos: [x, 0.62, z], color: '#7FA6C4', glow: 0.3,
        })),
      ]),
      // 7단계 — 조명탑 4기 + 진입 광장
      ...at(7, [
        { k: 'floodlight', pos: [1.16, 1.46, 0.72], h: 0.5 },
        { k: 'floodlight', pos: [-1.16, 1.46, 0.72], h: 0.5 },
        { k: 'floodlight', pos: [1.16, 1.46, -0.72], h: 0.5 },
        { k: 'floodlight', pos: [-1.16, 1.46, -0.72], h: 0.5 },
        { k: 'box', w: 0.9, h: 0.05, d: 0.38, z: 1.3, y: 0.06, color: CONC, rough: 0.9 },
        { k: 'box', w: 0.9, h: 0.05, d: 0.38, z: -1.3, y: 0.06, color: CONC, rough: 0.9 },
      ]),
      // 8단계 — 전광판 + 성화대 + 야간 조명
      ...at(8, [
        { k: 'box', w: 0.62, h: 0.28, d: 0.06, z: 0.62, y: 1.16, color: '#12161B', rough: 0.4, emissive: true },
        { k: 'box', w: 0.62, h: 0.28, d: 0.06, z: -0.62, y: 1.16, color: '#12161B', rough: 0.4, emissive: true },
        // 성화대 — 필드 위가 아니라 링 위(관중석 뒤)에 세운다. cyl 은 중심 고정이라
        // 오프셋 가능한 polyPrism 을 쓴다.
        { k: 'polyPrism', sides: 8, r: 0.12, h: 0.5, x: 0, z: -1.02, y: 1.41, color: CONC2, rough: 0.7 },
        { k: 'polyPrism', sides: 8, r: 0.17, h: 0.12, x: 0, z: -1.02, y: 1.91, color: 'accent', rough: 0.5 },
        { k: 'panel', w: 0.22, h: 0.24, pos: [0, 2.1, -1.02], color: 'accent', glow: 1 },
        ...around(20, 1.45, 1.1, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.06, pos: [x, 1.3, z], color: 'glassWarm', glow: 0.85,
        })),
      ]),
    ],
  },

  /** 2. 원형 대투기장 — 콜로세움. 3층 아치 아케이드 + 일부 붕괴한 상단 */
  lm_colosseum: {
    label: '원형 대투기장',
    group: 'landmark',
    parts: [
      // 1단계 — 기단 + 지하 구조가 드러난 아레나 바닥
      ...at(1, [
        ...podium(2.92, 2.92, 2, 0.05, 0, TRAVERTINE2, 0.1),
        { k: 'box', w: 1.3, h: 0.02, d: 0.96, y: 0.1, color: SAND, rough: 1 },
        { k: 'box', w: 1.1, h: 0.03, d: 0.16, y: 0.12, color: RUIN, rough: 1 },
        { k: 'box', w: 0.16, h: 0.03, d: 0.8, y: 0.12, color: RUIN, rough: 1 },
      ]),
      // 2단계 — 1층 아케이드
      ...at(2, [
        { k: 'ring', ro: 1.42, ri: 1.16, h: 0.42, y: 0.1, sx: 1, sz: 0.86, seg: 28, color: TRAVERTINE },
        ...archRing(20, 1.31, 1.13, 0.1, 0.13, 0.34, 0.05, 0.3, TRAVERTINE2),
      ]),
      // 3단계 — 내부 관중석 하단
      ...at(3, [
        { k: 'bowl', ro: 1.14, ri: 0.7, h: 0.34, y: 0.14, sx: 1, sz: 0.86, seg: 28, color: TRAVERTINE2 },
      ]),
      // 4단계 — 2층 아케이드
      ...at(4, [
        { k: 'ring', ro: 1.4, ri: 1.16, h: 0.4, y: 0.52, sx: 1, sz: 0.86, seg: 28, color: TRAVERTINE },
        ...archRing(20, 1.3, 1.12, 0.54, 0.13, 0.32, 0.05, 0.28, TRAVERTINE2),
      ]),
      // 5단계 — 3층 아케이드 + 관중석 상단
      ...at(5, [
        { k: 'ring', ro: 1.38, ri: 1.16, h: 0.38, y: 0.92, sx: 1, sz: 0.86, seg: 28, color: TRAVERTINE },
        ...archRing(20, 1.28, 1.1, 0.94, 0.12, 0.3, 0.05, 0.26, TRAVERTINE2),
        { k: 'bowl', ro: 1.12, ri: 0.82, h: 0.3, y: 0.5, sx: 1, sz: 0.86, seg: 28, color: RUIN },
      ]),
      // 6단계 — 최상층 벽(반쪽만 남은 형태) + 부벽
      ...at(6, [
        { k: 'ring', ro: 1.36, ri: 1.18, h: 0.34, y: 1.3, sx: 1, sz: 0.86, seg: 28, color: TRAVERTINE2 },
        ...around(10, 1.28, 1.1, (x, z, a) => ({
          k: 'box', w: 0.12, h: 0.3, d: 0.12, x, z, y: 1.3,
          color: a > Math.PI ? RUIN : TRAVERTINE, rough: 0.95,
        })),
      ]),
      // 7단계 — 부조 패널 + 진입 계단 + 붕괴 잔해
      ...at(7, [
        ...around(20, 1.33, 1.14, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.16, pos: [x, 1.16, z], color: SAND,
        })),
        { k: 'box', w: 0.7, h: 0.04, d: 0.3, z: 1.34, y: 0.06, color: TRAVERTINE, rough: 0.95 },
        { k: 'box', w: 0.3, h: 0.14, d: 0.24, x: -1.16, z: 1.02, y: 0.1, color: RUIN, rough: 1 },
        { k: 'box', w: 0.2, h: 0.1, d: 0.2, x: 1.2, z: -0.96, y: 0.1, color: RUIN, rough: 1 },
      ]),
      // 8단계 — 벨라리움(천막) 지주 + 아치 안쪽 조각상 + 야간 조명
      ...at(8, [
        ...around(14, 1.3, 1.12, (x, z) => ({
          k: 'box', w: 0.04, h: 0.34, d: 0.04, x, z, y: 1.64, color: '#6E5B3E', rough: 0.9,
        })),
        ...around(10, 1.26, 1.08, (x, z) => ({
          k: 'box', w: 0.07, h: 0.18, d: 0.07, x, z, y: 0.6, color: '#EDE6D2', rough: 0.8,
        })),
        ...around(16, 1.2, 1.02, (x, z) => ({
          k: 'panel', w: 0.09, h: 0.09, pos: [x, 0.24, z], color: 'accent', glow: 0.7,
        })),
      ]),
    ],
  },
} satisfies Record<string, BuildingConfig>
