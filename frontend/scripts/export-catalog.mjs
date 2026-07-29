/**
 * 건물 카탈로그(TS) → 백엔드 시드 JSON 덤프.
 *
 *   npm run export:catalog
 *   → backend/src/main/resources/catalog/buildings.json
 *
 * 모델링 데이터(parts)의 원본은 계속 이 저장소의 TS 파일이고, 백엔드는 그 스냅샷을
 * DB에 적재해 "누가 무엇을 보유했는가"를 판정하는 권위 소스가 된다.
 * 건물을 추가/수정했으면 이 스크립트를 다시 돌려 JSON을 갱신한 뒤 커밋할 것.
 *
 * 상점 메타(type/price)는 여기서 규칙으로 파생한다 — 건물마다 손으로 적지 않는다.
 *  - 기본 15종(catalog.ts): 가입 시 자동 지급이라 0P
 *  - 프리미엄 241종: 전부 같은 가격, 전부 NORMAL
 *  - 랜드마크(landmarks/*): 마을 정중앙 3×3 전용, 8단계로 자라는 거대 건물. 전부 LANDMARK
 *
 * ⚠️ type=LANDMARK 는 "정중앙 3×3 자리에 세울 수 있는 건물"이라는 뜻이다. 예전에는 테마마다
 * 앞 3종을 LANDMARK 로 표시했지만(=그냥 대표 건물), 그 값을 자리 판정에 쓰게 되면서 1칸짜리
 * 건물이 3×3 자리 후보로 올라오는 문제가 생겨 랜드마크 카탈로그 전용 표시로 회수했다.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { BUILDING_CONFIGS } from '../src/village/catalog.ts'
import { PREMIUM_CONFIGS, PREMIUM_THEMES } from '../src/village/premium/index.ts'
import {
  LANDMARK_CONFIGS,
  LANDMARK_DEFAULT_KEY,
  LANDMARK_PRICE,
  LANDMARK_THEME,
} from '../src/village/landmarks/index.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '..', '..')
const OUT = path.join(REPO, 'backend', 'src', 'main', 'resources', 'catalog', 'buildings.json')

/** 프리미엄 건물 가격(전 종류 동일). 기본 제공 건물은 0. */
const PREMIUM_PRICE = 300

// ── 1. parts → 바운딩 박스 ─────────────────────────────────────────────────

const PL = 0.07

/** 부품 하나가 차지하는 축정렬 범위. 렌더러(buildings.tsx)의 지오메트리와 맞춘 근사치. */
export function partBounds(p) {
  const box = (cx, cz, hw, hd, y0, y1) => ({ x0: cx - hw, x1: cx + hw, z0: cz - hd, z1: cz + hd, y0, y1 })
  switch (p.k) {
    case 'plinth': {
      const d = p.d ?? p.w
      return box(0, 0, (p.w * 1.14) / 2, (d * 1.14) / 2, 0, PL)
    }
    case 'box': {
      const y = p.y ?? 0
      return box(p.x ?? 0, p.z ?? 0, p.w / 2, (p.d ?? p.w) / 2, y, y + p.h)
    }
    case 'cyl': {
      const y = p.y ?? 0
      const r = Math.max(p.rt, p.rb)
      return box(0, 0, r, r, y, y + p.h)
    }
    case 'roof': {
      const d = p.d ?? p.w
      const h = p.height ?? 0.2
      // pyramid: 45° 회전한 4각뿔이라 축방향 반경은 R·cos45°
      if (p.type === 'pyramid') {
        const r = Math.max((Math.max(p.w, d) * 0.82) / Math.SQRT2, (p.w * 1.12) / 2)
        return box(0, 0, r, r, p.y, p.y + h + 0.03)
      }
      if (p.type === 'cone') return box(0, 0, p.w * 0.6, p.w * 0.6, p.y, p.y + h)
      if (p.type === 'dome') return box(0, 0, p.w * 0.36, p.w * 0.36, p.y, p.y + p.w * 0.36)
      return box(0, 0, p.w * 0.62, p.w * 0.62, p.y, p.y + 0.12)
    }
    case 'parapet': {
      const d = p.d ?? p.w
      return box(0, 0, (p.w + 0.03) / 2, (d + 0.03) / 2, p.y, p.y + 0.07)
    }
    case 'panel': {
      const [x, y, z] = p.pos
      const half = p.w / 2
      return box(x, z, half, half, y - p.h / 2, y + p.h / 2)
    }
    case 'rooftopUnits':
      return box(0, 0, p.w * 0.35, p.w * 0.35, p.y, p.y + 0.14)
    case 'cross': {
      const s = p.s ?? 1
      return box(0, p.z ?? 0, 0.085 * s, 0.015, p.y - 0.085 * s, p.y + 0.085 * s)
    }
    case 'antenna':
      return box(0, 0, 0.025, 0.025, p.y, p.y + (p.h ?? 0.34) + 0.025)
    case 'storefront': {
      const d = p.d ?? p.w
      return box(0, d / 2 + p.w * 0.11, p.w * 0.49, p.w * 0.13, 0, p.faceH)
    }
    case 'columns': {
      const d = p.d ?? p.w
      return box(0, d / 2 + 0.03, p.w * 0.45, 0.03, p.y, p.y + p.h + 0.05)
    }
    case 'balconies': {
      const d = p.d ?? p.w
      return box(0, d / 2 + 0.03, p.w * 0.46, 0.03, p.y0, p.y1 + 0.02)
    }
    case 'parasol': {
      const [x, y, z] = p.pos
      return box(x, z, 0.14, 0.14, y, y + 0.32)
    }
    case 'blades':
      return box(0, 0.2, 0.53, 0.02, p.y - 0.53, p.y + 0.53)
    case 'clock': {
      const r = Math.max(p.w / 2 + 0.006, p.w * 0.3)
      return box(0, 0, r, r, p.y - p.w * 0.3, p.y + p.w * 0.3)
    }
    case 'tree':
      return box(0, 0, 0.72, 0.72, 0, 2.26)

    // ── 랜드마크 부품 ──
    case 'polyPrism': {
      const y = p.y ?? 0
      return box(p.x ?? 0, p.z ?? 0, p.r, p.r, y, y + p.h)
    }
    case 'ring': {
      const y = p.y ?? 0
      return box(0, 0, p.ro * (p.sx ?? 1), p.ro * (p.sz ?? 1), y, y + p.h)
    }
    case 'bowl': {
      const y = p.y ?? 0
      // 안쪽으로 기울어진 띠라 두께 0.05 만큼 아래로 내려간다(BowlPart 와 같은 값).
      return box(0, 0, p.ro * (p.sx ?? 1), p.ro * (p.sz ?? 1), y - 0.05, y + p.h)
    }
    case 'arch': {
      const y = p.y ?? 0
      // 개구부 폭 + 양쪽 기둥. 상부 반원이 thick/2 만큼 더 올라간다.
      let hw = p.w / 2 + p.thick
      let hd = p.d / 2
      const quarter = Math.round(((p.rotY ?? 0) / (Math.PI / 2)) % 4)
      if (quarter % 2 !== 0) [hw, hd] = [hd, hw]
      return box(p.x ?? 0, p.z ?? 0, hw, hd, y, y + p.h + p.thick / 2)
    }
    case 'lattice': {
      const y = p.y ?? 0
      return box(0, 0, p.w / 2, p.w / 2, y, y + p.h)
    }
    case 'shell': {
      const [x, y, z] = p.pos
      return box(x, z, p.w / 2, p.d / 2, y, y + p.h)
    }
    case 'floodlight': {
      const [x, y, z] = p.pos
      return box(x, z, 0.1, 0.05, y, y + p.h + 0.1)
    }
    case 'pool': {
      const d = p.d ?? p.w
      const y = p.y ?? 0
      return box(p.x ?? 0, p.z ?? 0, (p.w + 0.07) / 2, (d + 0.07) / 2, y, y + 0.035)
    }
    default:
      return null
  }
}

/** ref 단위 크기. y는 지면(0) 기준이라 높이는 y1의 최댓값. */
function sizeOf(parts) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, y1 = 0
  for (const p of parts) {
    const b = partBounds(p)
    if (!b) continue
    x0 = Math.min(x0, b.x0); x1 = Math.max(x1, b.x1)
    z0 = Math.min(z0, b.z0); z1 = Math.max(z1, b.z1)
    y1 = Math.max(y1, b.y1)
  }
  if (!Number.isFinite(x0)) return { width: 0, depth: 0, height: 0 }
  const r3 = (n) => Math.round(n * 1000) / 1000
  return { width: r3(x1 - x0), depth: r3(z1 - z0), height: r3(y1) }
}

// ── 2. 덤프 ────────────────────────────────────────────────────────────────

const items = []
let sortOrder = 0

const push = (itemKey, config, theme, { type = 'NORMAL', price, defaultGranted } = {}) => {
  items.push({
    itemKey,
    name: config.label,
    theme,
    type,
    price,
    // 가입 시 자동 지급 대상 — 상점에서 살 필요 없이 처음부터 보유
    defaultGranted,
    size: sizeOf(config.parts),
    sortOrder: sortOrder++,
    parts: config.parts,
  })
}

for (const [key, config] of Object.entries(BUILDING_CONFIGS)) {
  push(key, config, 'BASIC', { price: 0, defaultGranted: true })
}

for (const theme of PREMIUM_THEMES) {
  for (const key of theme.keys) {
    push(key, PREMIUM_CONFIGS[key], theme.id.toUpperCase(), { price: PREMIUM_PRICE, defaultGranted: false })
  }
}

// 랜드마크 — 정중앙 3×3 자리 전용. 한 종은 무료로 지급해 중앙이 비지 않게 한다.
for (const [key, config] of Object.entries(LANDMARK_CONFIGS)) {
  const free = key === LANDMARK_DEFAULT_KEY
  push(key, config, LANDMARK_THEME, {
    type: 'LANDMARK',
    price: free ? 0 : LANDMARK_PRICE,
    defaultGranted: free,
  })
}

/**
 * 파일로 쓰는 건 이 스크립트를 직접 실행했을 때만 한다.
 * check-landmarks.mjs 가 partBounds 를 import 하는데, 그때 시드까지 다시 써지면
 * "검사만 돌렸는데 카탈로그가 바뀌는" 부작용이 생긴다.
 */
function dump() {
  mkdirSync(path.dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify({ version: 1, items }, null, 2) + '\n', 'utf8')

  const byTheme = items.reduce((acc, it) => ({ ...acc, [it.theme]: (acc[it.theme] ?? 0) + 1 }), {})
  console.log(`✅ ${items.length}종 → ${path.relative(REPO, OUT)}`)
  console.log(`   LANDMARK ${items.filter((i) => i.type === 'LANDMARK').length}종, 기본 지급 ${items.filter((i) => i.defaultGranted).length}종`)
  console.log(Object.entries(byTheme).map(([t, n]) => `   ${t}: ${n}`).join('\n'))

  // 랜드마크는 3×3(ref 3.0) 안에 들어가야 한다. 넘으면 옆 블록·길 위로 삐져나오는데
  // 화면을 열어보기 전까지 드러나지 않으므로 여기서 알린다.
  const oversized = items.filter((i) => i.type === 'LANDMARK' && (i.size.width > 3.02 || i.size.depth > 3.02))
  if (oversized.length > 0) {
    console.warn('⚠️ 3×3(ref 3.0) 을 넘는 랜드마크:')
    for (const i of oversized) {
      console.warn(`   ${i.itemKey}: ${i.size.width} × ${i.size.depth}`)
    }
  }
}

// partBounds 만 import 한 경우(check-landmarks)에는 실행되지 않는다.
const runDirectly = process.argv[1] != null
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (runDirectly) {
  dump()
}
