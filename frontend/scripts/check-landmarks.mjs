/**
 * 랜드마크 config 정합성 검사.
 *
 *   npm run check:landmarks
 *
 * 랜드마크는 부품 수십 개를 좌표로 직접 적어 만들기 때문에, 화면을 열지 않으면 드러나지 않는
 * 실수가 생긴다. 눈으로 못 잡는 것들만 여기서 걸러낸다.
 *
 *  1. 3×3(ref 3.0) 범위를 넘는 부품 — 옆 블록·길 위로 삐져나온다.
 *  2. 등장 단계(st) 누락·범위 초과 — 진행률이 올라도 아무 변화가 없는 단계가 생긴다.
 *  3. 중심 고정 부품에 x/z 를 준 경우 — 렌더러가 무시해서 전부 가운데로 겹쳐 쌓인다.
 *  4. plinth 사용 — 폭을 1.14 배로 키워 그리므로 랜드마크 규격을 넘긴다.
 *  5. 팔레트에 없는 색 이름 — resolveColor 가 조용히 크림색으로 떨어진다.
 */
import { LANDMARK_CONFIGS } from '../src/village/landmarks/index.ts'
import { PALETTE } from '../src/village/palette.ts'
import { partBounds } from './export-catalog.mjs'

/** 랜드마크 한 변 상한(ref). partTypes.LANDMARK_REF 와 같은 값. */
const LIMIT = 1.5

/** x/z 오프셋을 렌더러가 무시하는 부품 — 중심에 고정된다. */
const CENTER_ONLY = new Set([
  'plinth', 'cyl', 'roof', 'parapet', 'rooftopUnits', 'storefront',
  'columns', 'balconies', 'blades', 'clock', 'tree', 'ring', 'bowl', 'lattice',
])

const paletteKeys = new Set(Object.keys(PALETTE))
const problems = []

for (const [key, config] of Object.entries(LANDMARK_CONFIGS)) {
  const stages = new Set()
  let height = 0

  for (const p of config.parts) {
    const st = p.st ?? 1
    stages.add(st)

    if (!Number.isInteger(st) || st < 1 || st > 8) {
      problems.push(`${key}: st=${st} (${p.k}) — 1~8 정수여야 한다`)
    }
    if (p.k === 'plinth') {
      problems.push(`${key}: plinth 사용 — 폭이 1.14 배로 커진다. box 슬래브로 바꿀 것`)
    }
    if (CENTER_ONLY.has(p.k) && (p.x || p.z)) {
      problems.push(`${key}: st${st} ${p.k} 에 x/z 를 줬지만 렌더러가 무시한다 — 중심에 겹쳐 쌓인다`)
    }

    for (const c of [p.color, p.windows?.color, p.awning, p.sign]) {
      if (typeof c === 'string' && !c.startsWith('#') && !paletteKeys.has(c)) {
        problems.push(`${key}: st${st} ${p.k} 색 '${c}' 이 팔레트에 없다`)
      }
    }

    const b = partBounds(p)
    if (!b) {
      problems.push(`${key}: st${st} ${p.k} — partBounds 미구현(크기 계산에서 빠진다)`)
      continue
    }
    height = Math.max(height, b.y1)
    const over = Math.max(-b.x0, b.x1, -b.z0, b.z1) - LIMIT
    if (over > 0.001) {
      problems.push(`${key}: st${st} ${p.k} 이 3×3 을 ${over.toFixed(3)} 넘는다`)
    }
  }

  const missing = [1, 2, 3, 4, 5, 6, 7, 8].filter((s) => !stages.has(s))
  if (missing.length > 0) {
    problems.push(`${key}: 단계 ${missing.join(',')} 에 부품이 없다 — 그 구간은 변화가 안 보인다`)
  }

  console.log(`${key.padEnd(22)} 부품 ${String(config.parts.length).padStart(3)}개 · 높이 ${height.toFixed(2)}`)
}

console.log(`\n랜드마크 ${Object.keys(LANDMARK_CONFIGS).length}종`)
if (problems.length === 0) {
  console.log('✅ 문제 없음')
} else {
  console.error(`❌ ${problems.length}건`)
  for (const p of problems) console.error('   ' + p)
  process.exitCode = 1
}
