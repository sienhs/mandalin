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
 *  - 프리미엄 241종: 전부 같은 가격
 *  - 프리미엄 테마 파일은 "랜드마크 우선" 순서로 작성되어 있어 앞 3종을 LANDMARK로 취급
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { BUILDING_CONFIGS } from '../src/village/catalog.ts'
import { PREMIUM_CONFIGS, PREMIUM_THEMES } from '../src/village/premium/index.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '..', '..')
const OUT = path.join(REPO, 'backend', 'src', 'main', 'resources', 'catalog', 'buildings.json')

/** 테마별 앞에서부터 이 개수만큼 LANDMARK. */
const LANDMARKS_PER_THEME = 3
/** 프리미엄 건물 가격(전 종류 동일). 기본 제공 건물은 0. */
const PREMIUM_PRICE = 300
/** 기본 15종 중 랜드마크 취급할 건물. */
const BASIC_LANDMARKS = ['clocktower', 'windmill', 'skyscraper', 'civic']

// ── 1. parts → 바운딩 박스 ─────────────────────────────────────────────────

const PL = 0.07

/** 부품 하나가 차지하는 축정렬 범위. 렌더러(buildings.tsx)의 지오메트리와 맞춘 근사치. */
function partBounds(p) {
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

const push = (itemKey, config, theme, type) => {
  const basic = theme === 'BASIC'
  items.push({
    itemKey,
    name: config.label,
    theme,
    type,
    price: basic ? 0 : PREMIUM_PRICE,
    // 가입 시 자동 지급 대상 — 상점에서 살 필요 없이 처음부터 보유
    defaultGranted: basic,
    size: sizeOf(config.parts),
    sortOrder: sortOrder++,
    parts: config.parts,
  })
}

for (const [key, config] of Object.entries(BUILDING_CONFIGS)) {
  push(key, config, 'BASIC', BASIC_LANDMARKS.includes(key) ? 'LANDMARK' : 'NORMAL')
}

for (const theme of PREMIUM_THEMES) {
  theme.keys.forEach((key, i) => {
    push(key, PREMIUM_CONFIGS[key], theme.id.toUpperCase(), i < LANDMARKS_PER_THEME ? 'LANDMARK' : 'NORMAL')
  })
}

mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ version: 1, items }, null, 2) + '\n', 'utf8')

const byTheme = items.reduce((acc, it) => ({ ...acc, [it.theme]: (acc[it.theme] ?? 0) + 1 }), {})
console.log(`✅ ${items.length}종 → ${path.relative(REPO, OUT)}`)
console.log(`   LANDMARK ${items.filter((i) => i.type === 'LANDMARK').length}종, 기본 지급 ${items.filter((i) => i.defaultGranted).length}종`)
console.log(Object.entries(byTheme).map(([t, n]) => `   ${t}: ${n}`).join('\n'))
