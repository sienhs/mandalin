import type { BuildingConfig } from '../partTypes'
import { at, around, mirrorX, podium } from './_helpers'

/**
 * 랜드마크 — 탑·유적·문화시설 계열 (3×3, 8단계).
 *
 * 모티브: 격자 철탑(에펠), 삼엽 초고층(부르즈), 항만 오페라하우스(시드니),
 *         대피라미드 군(기자).
 * 높이로 승부하는 종류라 다른 랜드마크보다 y 상한이 높다 — 삼엽 초고층이 6.83 ref,
 * `BUILD_SCALE`(2.4)를 곱해 월드 약 16 이다. 폭 상한(`LANDMARK_REF` 3.0)과 달리 높이에는
 * 상한이 없다. 옆 블록을 덮지 않으므로 `check:landmarks` 도 높이는 재기만 한다.
 */

const IRON = '#6E5A46'
const IRON2 = '#8A7259'
const PLAZA = '#C3BCAA'
const LAWN = '#4C7A46'

const SKY_GLASS = '#8FB4D0'
const SKY_GLASS2 = '#6E97B8'
const SKY_STEEL = '#B9C3CC'

const SHELL_W = '#F4F1E9'
const SHELL_W2 = '#E3DFD4'
const PIER = '#B9AE99'
const SEA = '#3E7C9B'

const LIMESTONE = '#D9C79A'
const LIMESTONE2 = '#C6B182'
const CAP_GOLD = '#D9B04A'
const SAND = '#CBB27E'

export const TOWER_LANDMARKS = {
  /** 10. 격자 철탑 — 4각 아치 기단 + 전망대 2개 + 첨탑. 마을 최고 높이 */
  lm_iron_tower: {
    label: '격자 철탑',
    group: 'landmark',
    parts: [
      // 1단계 — 광장 + 네 기초 블록
      ...at(1, [
        { k: 'box', w: 2.9, h: 0.05, d: 2.9, y: 0, color: PLAZA, rough: 0.95 },
        ...around(4, 0.86, 0.86, (x, z) => ({
          k: 'box', w: 0.44, h: 0.14, d: 0.44, x, z, y: 0.05, color: 'concrete', rough: 0.95,
        })),
      ]),
      // 2단계 — 네 다리(바깥으로 벌어진 하부)
      ...at(2, [
        { k: 'lattice', w: 2.1, h: 0.9, y: 0.19, taper: 0.62, rungs: 3, color: IRON },
      ]),
      // 3단계 — 1층 아치 + 플랫폼
      ...at(3, [
        { k: 'arch', w: 0.9, h: 0.78, d: 1.9, thick: 0.14, y: 0.19, color: IRON2 },
        { k: 'arch', w: 0.9, h: 0.78, d: 1.9, thick: 0.14, y: 0.19, rotY: Math.PI / 2, color: IRON2 },
        { k: 'box', w: 1.5, h: 0.09, d: 1.5, y: 1.09, color: IRON2, rough: 0.6, metal: 0.35 },
      ]),
      // 4단계 — 1전망대 + 중간 격자
      ...at(4, [
        { k: 'box', w: 1.3, h: 0.22, d: 1.3, y: 1.18, color: IRON2, rough: 0.55, metal: 0.4, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.32 } },
        { k: 'lattice', w: 1.2, h: 1.1, y: 1.4, taper: 0.6, rungs: 4, color: IRON },
      ]),
      // 5단계 — 2전망대 + 상부 격자
      ...at(5, [
        { k: 'box', w: 0.86, h: 0.09, d: 0.86, y: 2.5, color: IRON2, rough: 0.6, metal: 0.35 },
        { k: 'box', w: 0.76, h: 0.2, d: 0.76, y: 2.59, color: IRON2, rough: 0.55, metal: 0.4, windows: { from: 0.2, to: 0.85, color: 'glassWarm', glow: 0.32 } },
        { k: 'lattice', w: 0.7, h: 1.3, y: 2.79, taper: 0.5, rungs: 5, color: IRON },
      ]),
      // 6단계 — 최상 전망실 + 첨탑
      ...at(6, [
        { k: 'box', w: 0.42, h: 0.06, d: 0.42, y: 4.09, color: IRON2, rough: 0.6, metal: 0.35 },
        { k: 'box', w: 0.36, h: 0.22, d: 0.36, y: 4.15, color: SHELL_W2, rough: 0.4, metal: 0.3, windows: { from: 0.2, to: 0.85, color: 'glass', glow: 0.42 } },
        { k: 'cyl', rt: 0.05, rb: 0.12, h: 0.7, y: 4.37, color: IRON2, seg: 8 },
      ]),
      // 7단계 — 광장 조경·매표소·아치 장식
      ...at(7, [
        ...around(6, 1.24, 1.24, (x, z) => ({
          k: 'box', w: 0.12, h: 0.24, d: 0.12, x, z, y: 0.05, color: 'bush', rough: 1,
        })),
        ...mirrorX([{ k: 'box', w: 0.34, h: 0.2, d: 0.24, x: 1.12, z: 0.9, y: 0.05, color: SHELL_W2, rough: 0.7 }]),
        { k: 'box', w: 1.9, h: 0.02, d: 0.46, z: 1.24, y: 0.05, color: LAWN, rough: 1 },
        { k: 'panel', w: 0.7, h: 0.14, pos: [0, 1.0, 0.76], color: CAP_GOLD, glow: 0.25 },
      ]),
      // 8단계 — 첨탑 마감 + 안테나·항공장애등 + 야간 조명
      ...at(8, [
        /*
          첨탑 최상단 마감. **이 단계에 실루엣을 만드는 부품이 하나는 있어야 한다** —
          나머지가 전부 `antenna`·`panel`(= DETAIL_KINDS)이라, 디테일을 끄고 그리는
          작은 미리보기(`VillagePreview` 의 details=false)에서 7단계와 완전히 같은 그림이
          나왔다. 만다라트를 다 채운 순간이 안 보이는 셈이다.
        */
        { k: 'cyl', rt: 0.028, rb: 0.075, h: 0.22, y: 5.07, color: IRON2, seg: 6 },
        { k: 'antenna', y: 5.29, h: 0.5 },
        { k: 'panel', w: 0.3, h: 0.3, pos: [0, 1.28, 0.66], color: 'glassWarm', glow: 0.6 },
        ...around(8, 0.9, 0.9, (x, z) => ({
          k: 'panel', w: 0.12, h: 0.12, pos: [x, 0.3, z], color: 'accent', glow: 0.9,
        })),
        ...around(4, 0.5, 0.5, (x, z) => ({
          k: 'panel', w: 0.1, h: 0.1, pos: [x, 2.4, z], color: 'glassWarm', glow: 0.85,
        })),
      ]),
    ],
  },

  /** 11. 삼엽 초고층 — 세트백으로 좁아지며 올라가는 초고층 + 스파이어 */
  lm_spire_tower: {
    label: '삼엽 초고층',
    group: 'landmark',
    parts: [
      // 1단계 — 광장 + 반사 수반
      ...at(1, [
        { k: 'box', w: 2.9, h: 0.05, d: 2.9, y: 0, color: PLAZA, rough: 0.95 },
        { k: 'pool', w: 2.2, d: 0.8, z: 1.0, y: 0.05, color: 'water' },
      ]),
      // 2단계 — 포디움(상업 저층부)
      ...at(2, [
        { k: 'box', w: 2.0, h: 0.3, d: 1.5, z: -0.4, y: 0.05, color: SKY_STEEL, rough: 0.5, metal: 0.3, windows: { from: 0.2, to: 0.85, color: SKY_GLASS, glow: 0.3 } },
        { k: 'box', w: 2.1, h: 0.05, d: 1.6, z: -0.4, y: 0.35, color: SHELL_W2, rough: 0.6 },
      ]),
      // 3단계 — 삼엽 평면 하부(중심 코어 + 세 날개)
      ...at(3, [
        { k: 'polyPrism', sides: 6, r: 0.62, h: 1.2, y: 0.4, color: SKY_GLASS, rough: 0.2, metal: 0.6 },
        ...around(3, 0.5, 0.5, (x, z) => ({
          k: 'box', w: 0.44, h: 1.2, d: 0.44, x, z, y: 0.4, color: SKY_GLASS2, rough: 0.2, metal: 0.6, windows: { from: 0.08, to: 0.95, color: SKY_GLASS, glow: 0.4 },
        })),
      ]),
      // 4단계 — 1차 세트백
      ...at(4, [
        { k: 'polyPrism', sides: 6, r: 0.52, h: 1.1, y: 1.6, color: SKY_GLASS, rough: 0.2, metal: 0.6 },
        ...around(3, 0.4, 0.4, (x, z) => ({
          k: 'box', w: 0.34, h: 1.1, d: 0.34, x, z, y: 1.6, color: SKY_GLASS2, rough: 0.2, metal: 0.6, windows: { from: 0.08, to: 0.95, color: SKY_GLASS, glow: 0.4 },
        })),
      ]),
      // 5단계 — 2차 세트백
      ...at(5, [
        { k: 'polyPrism', sides: 6, r: 0.42, h: 1.0, y: 2.7, color: SKY_GLASS, rough: 0.2, metal: 0.6 },
        ...around(3, 0.3, 0.3, (x, z) => ({
          k: 'box', w: 0.26, h: 0.8, d: 0.26, x, z, y: 2.7, color: SKY_GLASS2, rough: 0.2, metal: 0.6,
        })),
      ]),
      // 6단계 — 3차 세트백 + 전망층
      ...at(6, [
        { k: 'polyPrism', sides: 6, r: 0.3, h: 0.9, y: 3.7, color: SKY_GLASS, rough: 0.2, metal: 0.6 },
        { k: 'polyPrism', sides: 6, r: 0.36, h: 0.12, y: 4.24, color: SKY_STEEL, rough: 0.4, metal: 0.5 },
        { k: 'polyPrism', sides: 6, r: 0.2, h: 0.6, y: 4.6, color: SKY_GLASS2, rough: 0.2, metal: 0.6 },
      ]),
      // 7단계 — 스파이어 + 포디움 캐노피·조경
      ...at(7, [
        { k: 'cyl', rt: 0.02, rb: 0.11, h: 1.0, y: 5.2, color: SKY_STEEL, seg: 8 },
        { k: 'box', w: 1.0, h: 0.04, d: 0.3, z: 0.42, y: 0.32, color: SKY_STEEL, rough: 0.4, metal: 0.5 },
        ...around(6, 1.22, 1.22, (x, z) => ({
          k: 'box', w: 0.1, h: 0.22, d: 0.1, x, z, y: 0.05, color: 'bush', rough: 1,
        })),
      ]),
      // 8단계 — 스파이어 왕관 + 항공등·분수 조명 + 야간 커튼월 발광
      ...at(8, [
        // 스파이어 최상단 왕관. 격자 철탑과 같은 이유로 둔다 — 이 단계에 비디테일 부품이
        // 없으면 details=false 로 그리는 미리보기에서 7단계와 구별되지 않는다.
        { k: 'cyl', rt: 0.014, rb: 0.055, h: 0.2, y: 6.2, color: SKY_STEEL, seg: 8 },
        { k: 'antenna', y: 6.4, h: 0.4 },
        ...around(3, 0.52, 0.52, (x, z) => ({
          k: 'panel', w: 0.3, h: 1.0, pos: [x, 1.0, z], color: SKY_GLASS, glow: 0.55,
        })),
        ...around(8, 1.0, 1.0, (x, z) => ({
          k: 'panel', w: 0.12, h: 0.12, pos: [x, 0.12, z], color: 'glassWarm', glow: 0.85,
        })),
      ]),
    ],
  },

  /** 12. 항만 오페라하우스 — 부두 기단 + 조가비 쉘 지붕 */
  lm_harbor_opera: {
    label: '항만 오페라하우스',
    group: 'landmark',
    parts: [
      // 1단계 — 바다 + 부두 부지
      ...at(1, [
        { k: 'box', w: 2.9, h: 0.03, d: 2.9, y: 0, color: SEA, rough: 0.15, metal: 0.5 },
        { k: 'box', w: 2.1, h: 0.08, d: 1.7, z: -0.2, y: 0.03, color: PIER, rough: 0.95 },
      ]),
      // 2단계 — 기단 계단 + 데크
      ...at(2, [
        ...podium(1.9, 1.5, 3, 0.07, 0.11, PIER, 0.14),
        { k: 'box', w: 0.9, h: 0.05, d: 0.4, z: 0.9, y: 0.11, color: PIER, rough: 0.95 },
      ]),
      // 3단계 — 하부 콘서트홀 매스
      ...at(3, [
        { k: 'box', w: 1.5, h: 0.34, d: 1.1, z: -0.2, y: 0.32, color: SHELL_W2, rough: 0.6, windows: { from: 0.2, to: 0.85, color: SKY_GLASS, glow: 0.3 } },
      ]),
      // 4단계 — 큰 쉘 2장(주 오디토리엄)
      ...at(4, [
        { k: 'shell', w: 1.0, h: 1.0, d: 0.9, pos: [-0.34, 0.66, -0.3], rotY: Math.PI * 0.08, color: SHELL_W },
        { k: 'shell', w: 0.92, h: 0.86, d: 0.82, pos: [0.36, 0.66, -0.38], rotY: -Math.PI * 0.08, color: SHELL_W },
      ]),
      // 5단계 — 중간 쉘 2장
      ...at(5, [
        { k: 'shell', w: 0.76, h: 0.72, d: 0.7, pos: [-0.28, 0.66, 0.16], rotY: Math.PI * 0.14, color: SHELL_W },
        { k: 'shell', w: 0.7, h: 0.64, d: 0.64, pos: [0.3, 0.66, 0.12], rotY: -Math.PI * 0.14, color: SHELL_W },
      ]),
      // 6단계 — 작은 쉘(레스토랑) + 유리 파사드
      ...at(6, [
        { k: 'shell', w: 0.5, h: 0.44, d: 0.46, pos: [0.02, 0.66, 0.6], rotY: Math.PI * 0.5, color: SHELL_W },
        { k: 'panel', w: 1.3, h: 0.3, pos: [0, 0.5, 0.36], color: SKY_GLASS, glow: 0.34 },
      ]),
      // 7단계 — 부두 산책로·계류장·가로수
      ...at(7, [
        ...mirrorX([{ k: 'box', w: 0.22, h: 0.06, d: 1.5, x: 1.16, z: -0.2, y: 0.03, color: PIER, rough: 0.95 }]),
        ...mirrorX([{ k: 'box', w: 0.09, h: 0.24, d: 0.09, x: 1.16, z: 0.62, y: 0.09, color: 'wood', rough: 0.9 }]),
        ...around(4, 1.02, 1.02, (x, z) => ({
          k: 'box', w: 0.1, h: 0.2, d: 0.1, x, z, y: 0.11, color: 'bush', rough: 1,
        })),
      ]),
      // 8단계 — 쉘 조명 + 정박한 배 + 야간 수면 반사
      ...at(8, [
        { k: 'box', w: 0.34, h: 0.09, d: 0.16, x: -1.2, z: 1.06, y: 0.03, color: SHELL_W, rough: 0.6 },
        { k: 'box', w: 0.05, h: 0.3, d: 0.05, x: -1.2, z: 1.06, y: 0.12, color: 'wood' },
        ...around(6, 0.8, 0.8, (x, z) => ({
          k: 'panel', w: 0.14, h: 0.14, pos: [x, 0.2, z], color: 'glassWarm', glow: 0.85,
        })),
        { k: 'panel', w: 1.2, h: 0.26, pos: [0, 0.46, 0.38], color: 'accent', glow: 0.5 },
      ]),
    ],
  },

  /** 13. 대피라미드 군 — 피라미드 3기 + 스핑크스 + 참배로 */
  lm_giza_pyramids: {
    label: '대피라미드 군',
    group: 'landmark',
    parts: [
      // 1단계 — 사막 대지 + 채석 정지면
      ...at(1, [
        { k: 'box', w: 2.9, h: 0.05, d: 2.9, y: 0, color: SAND, rough: 1 },
        { k: 'box', w: 1.8, h: 0.03, d: 1.8, x: -0.3, z: -0.3, y: 0.05, color: LIMESTONE2, rough: 1 },
      ]),
      // 2단계 — 대피라미드 하부(계단식 적층)
      ...at(2, [
        ...podium(1.7, 1.7, 3, 0.16, 0.05, LIMESTONE, 0.2),
      ]),
      // 3단계 — 대피라미드 상부
      ...at(3, [
        { k: 'roof', type: 'pyramid', w: 1.34, d: 1.34, y: 0.53, height: 0.95, color: LIMESTONE },
      ]),
      // 4단계 — 2호 피라미드
      ...at(4, [
        { k: 'box', w: 0.98, h: 0.12, d: 0.98, x: 1.0, z: 0.72, y: 0.05, color: LIMESTONE2, rough: 1 },
        { k: 'box', w: 0.8, h: 0.5, d: 0.8, x: 1.0, z: 0.72, y: 0.17, color: LIMESTONE2, rough: 1 },
        { k: 'box', w: 0.5, h: 0.34, d: 0.5, x: 1.0, z: 0.72, y: 0.67, color: LIMESTONE2, rough: 1 },
        { k: 'box', w: 0.22, h: 0.2, d: 0.22, x: 1.0, z: 0.72, y: 1.01, color: LIMESTONE2, rough: 1 },
      ]),
      // 5단계 — 3호 피라미드 + 위성 소피라미드
      ...at(5, [
        { k: 'box', w: 0.56, h: 0.3, d: 0.56, x: -1.06, z: 0.9, y: 0.05, color: LIMESTONE2, rough: 1 },
        { k: 'box', w: 0.34, h: 0.24, d: 0.34, x: -1.06, z: 0.9, y: 0.35, color: LIMESTONE2, rough: 1 },
        { k: 'box', w: 0.14, h: 0.12, d: 0.14, x: -1.06, z: 0.9, y: 0.59, color: LIMESTONE2, rough: 1 },
        ...mirrorX([{ k: 'box', w: 0.2, h: 0.16, d: 0.2, x: 0.5, z: 1.24, y: 0.05, color: LIMESTONE2, rough: 1 }]),
      ]),
      // 6단계 — 스핑크스 + 하안 신전
      ...at(6, [
        { k: 'box', w: 0.7, h: 0.18, d: 0.26, x: 0.1, z: 1.16, y: 0.05, color: LIMESTONE, rough: 1 },
        { k: 'box', w: 0.2, h: 0.24, d: 0.24, x: 0.46, z: 1.16, y: 0.23, color: LIMESTONE, rough: 1 },
        { k: 'box', w: 0.16, h: 0.1, d: 0.2, x: 0.56, z: 1.16, y: 0.31, color: CAP_GOLD, rough: 0.8 },
        { k: 'box', w: 0.5, h: 0.22, d: 0.4, x: -0.66, z: 1.2, y: 0.05, color: LIMESTONE2, rough: 1 },
      ]),
      // 7단계 — 참배로 + 오벨리스크 + 채석 잔해
      ...at(7, [
        { k: 'box', w: 0.36, h: 0.03, d: 1.1, x: 0.1, z: 0.5, y: 0.05, color: LIMESTONE, rough: 1 },
        ...mirrorX([{ k: 'box', w: 0.1, h: 0.5, d: 0.1, x: 0.42, z: 1.42, y: 0.05, color: LIMESTONE, rough: 0.95 }]),
        ...mirrorX([{ k: 'box', w: 0.05, h: 0.12, d: 0.05, x: 0.42, z: 1.42, y: 0.55, color: CAP_GOLD, rough: 0.5, metal: 0.5 }]),
        { k: 'box', w: 0.22, h: 0.1, d: 0.22, x: -1.3, z: -0.9, y: 0.05, color: LIMESTONE2, rough: 1 },
      ]),
      // 8단계 — 금박 캡스톤 + 봉헌 화톳불
      ...at(8, [
        { k: 'roof', type: 'pyramid', w: 0.3, d: 0.3, y: 1.36, height: 0.22, color: CAP_GOLD },
        { k: 'box', w: 0.1, h: 0.1, d: 0.1, x: 1.0, z: 0.72, y: 1.21, color: CAP_GOLD, rough: 0.4, metal: 0.6 },
        ...around(6, 1.06, 1.06, (x, z) => [
          { k: 'polyPrism' as const, sides: 6, r: 0.07, h: 0.16, x, z, y: 0.05, color: '#6E6A62', rough: 0.9 },
          { k: 'panel' as const, w: 0.14, h: 0.14, pos: [x, 0.26, z] as [number, number, number], color: 'accent', glow: 1 },
        ]),
      ]),
    ],
  },
} satisfies Record<string, BuildingConfig>
