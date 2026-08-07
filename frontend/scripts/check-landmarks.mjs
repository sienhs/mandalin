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
 *  6. 아무것도 뒤집지 못한 mirrorX — 대칭 부품이 한쪽만 붙는다.
 *  7. 비디테일 부품이 0 인 단계 — details=false 로 그리는 미리보기에서 앞 단계와 같아진다.
 *  8. 받침이 없는 부품 — 공중에 뜬다. 받침이 늦은 단계면 그 사이 구간이 떠 있다.
 *  9. 다른 부품 속에 파묻힌 panel — 그리는 값은 다 맞는데 화면에 없다.
 *
 * 8·9 는 **바운딩 박스로는 못 잡는다** — ring·bowl·polyPrism(hollow) 은 가운데가 뚫려 있고,
 * 정다각형은 꼭짓점과 변의 거리가 다르다. 그래서 `solidAt` 으로 "그 (x,z) 기둥에 실제로
 * 재질이 있는가"를 부품 종류별로 판정한다.
 */
import { LANDMARK_CONFIGS } from '../src/village/landmarks/index.ts'
import { MIRROR_NOOPS } from '../src/village/landmarks/_helpers.ts'
import { PALETTE } from '../src/village/palette.ts'
import { DETAIL_KINDS } from '../src/village/partTypes.ts'
import { partBounds } from './export-catalog.mjs'

/*
  6번은 **결과 배열만 보고는 잡을 수 없다** — 짝이 없는 부품과 애초에 하나만 적은 부품이
  구별되지 않기 때문이다. 그래서 `mirrorX` 가 무효 호출을 `MIRROR_NOOPS` 에 적어 두고 여기서
  읽는다. console 을 가로채는 방법은 안 통한다 — config 는 정적 import 시점에 이미 만들어져
  있어서(이 파일도 `export-catalog.mjs` 를 통해 그걸 끌어온다) 가로챌 때는 늦다.
*/

/**
 * 랜드마크 부지 반경 상한(ref). `partTypes.LANDMARK_REF`(= 한 변 3.0)의 **절반**이다 —
 * `partBounds` 가 중심 기준 좌표를 돌려주므로 비교할 값은 반경이다.
 */
const LIMIT = 1.5

/** x/z 오프셋을 렌더러가 무시하는 부품 — 중심에 고정된다. */
const CENTER_ONLY = new Set([
  'plinth', 'cyl', 'roof', 'parapet', 'rooftopUnits', 'storefront',
  'columns', 'balconies', 'blades', 'clock', 'tree', 'ring', 'bowl', 'lattice',
])

/**
 * (x, z) 기둥에 이 부품의 재질이 있는가. `m` 은 여유(표면에 살짝 붙인 것을 파묻힌 것으로
 * 세지 않기 위한 안쪽 여백).
 *
 * 여기 없는 종류는 `null` — "모르겠다"로 두고 판정에서 뺀다. `lattice`·`arch` 는 대부분
 * 빈 공간이라(격자·개구부) 재질로 세면 그 안에 놓은 부품이 죄다 파묻힘으로 잡힌다.
 */
function solidAt(p, x, z, m = 0) {
  const cx = p.x ?? 0, cz = p.z ?? 0
  const dx = x - cx, dz = z - cz
  switch (p.k) {
    case 'box':
      return Math.abs(dx) <= p.w / 2 - m && Math.abs(dz) <= (p.d ?? p.w) / 2 - m
    case 'shell': {
      const [px, , pz] = p.pos
      return Math.abs(x - px) <= p.w / 2 - m && Math.abs(z - pz) <= p.d / 2 - m
    }
    case 'cyl':
      return Math.hypot(x, z) <= Math.max(p.rt, p.rb) - m
    case 'roof': {
      const d = p.d ?? p.w
      return Math.abs(x) <= p.w / 2 - m && Math.abs(z) <= d / 2 - m
    }
    case 'ring':
    case 'bowl': {
      // 타원 링 — 정규화 반경으로 안팎을 본다(bounds 가 ro·sx, ro·sz 를 쓰는 것과 같은 기준).
      const nr = Math.hypot(x / (p.sx ?? 1), z / (p.sz ?? 1))
      return nr >= p.ri + m && nr <= p.ro - m
    }
    case 'polyPrism': {
      /*
        정n각형. 렌더러가 반 세그먼트를 미리 돌려 면 하나를 +z 로 맞추므로(`PolyPrismPart`)
        면 f 의 법선 방향은 `rot + f·2π/n` 이고, 중심에서 면까지는 r·cos(π/n) 이다.
      */
      const n = p.sides
      const apo = p.r * Math.cos(Math.PI / n)
      let far = -Infinity
      for (let f = 0; f < n; f++) {
        const th = (p.rot ?? 0) + (f / n) * Math.PI * 2
        far = Math.max(far, dx * Math.sin(th) + dz * Math.cos(th))
      }
      if (far > apo - m) return false
      return p.hollow == null || p.hollow <= 0 || p.hollow >= 1 ? true : far >= apo * p.hollow + m
    }
    default:
      return null
  }
}

/**
 * 부품이 밑면에서 실제로 밟고 있는 (x, z) 표본점.
 *
 * 네모난 부품은 밑면을 3×3 으로 훑는다(테두리에 딱 붙이면 옆 부품을 집으므로 살짝 안쪽).
 * **링은 그렇게 훑으면 안 된다** — 바운딩 박스의 표본이 죄다 구멍이나 밖으로 떨어져서,
 * 자기 아래 링 위에 정확히 얹혀 있어도 부양으로 잡힌다. 링은 띠 중앙을 따라 돈다.
 */
function footprint(p, b) {
  /*
    띠를 안쪽·중간·바깥 세 반경으로 훑는다. 중간만 보면 **캔틸레버 지붕**을 놓친다 —
    안쪽으로 뻗은 지붕 링은 바깥 테두리만 벽에 얹혀 있고 중간은 원래 허공이다.
  */
  const ringMid = (ri, ro, sx = 1, sz = 1) =>
    [0.1, 0.5, 0.9].flatMap((t) => {
      const rm = ri + (ro - ri) * t
      return Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return [Math.cos(a) * rm * sx, Math.sin(a) * rm * sz]
      })
    })
  if (p.k === 'ring' || p.k === 'bowl') return ringMid(p.ri, p.ro, p.sx ?? 1, p.sz ?? 1)
  if (p.k === 'polyPrism' && p.hollow > 0 && p.hollow < 1) {
    const apo = p.r * Math.cos(Math.PI / p.sides)
    return ringMid(apo * p.hollow, apo)
  }
  const at = (lo, hi, t) => lo + (hi - lo) * t
  const xs = [0.05, 0.5, 0.95].map((t) => at(b.x0, b.x1, t))
  const zs = [0.05, 0.5, 0.95].map((t) => at(b.z0, b.z1, t))
  return xs.flatMap((x) => zs.map((z) => [x, z]))
}

const paletteKeys = new Set(Object.keys(PALETTE))
const problems = []

for (const [key, config] of Object.entries(LANDMARK_CONFIGS)) {
  const stages = new Set()
  /** 단계별 비디테일(= 실루엣을 만드는) 부품 수. */
  const solidPerStage = new Map()
  let height = 0

  for (const p of config.parts) {
    const st = p.st ?? 1
    stages.add(st)
    if (!DETAIL_KINDS.has(p.k)) solidPerStage.set(st, (solidPerStage.get(st) ?? 0) + 1)

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

  /*
    부품이 있어도 전부 DETAIL_KINDS 면(panel·antenna·pool 등) `details=false` 로 그리는 곳에서는
    아무것도 안 나온다 — `VillagePreview` 가 그렇게 그리므로 그 단계가 앞 단계와 같은 그림이 된다.
    실제로 격자 철탑·삼엽 초고층의 8단계가 그랬다. 완성한 순간이 미리보기에서 안 보인다.
  */
  const detailOnly = [1, 2, 3, 4, 5, 6, 7, 8].filter(
    (s) => stages.has(s) && (solidPerStage.get(s) ?? 0) === 0,
  )
  if (detailOnly.length > 0) {
    problems.push(
      `${key}: 단계 ${detailOnly.join(',')} 가 디테일 부품만으로 돼 있다 — ` +
        `details=false 미리보기에서 앞 단계와 같아진다. 실루엣 부품을 하나 넣을 것`,
    )
  }

  /*
    8. 받침 검사 — 실루엣 부품(디테일 제외)의 밑면 아래에 재질이 있는가.

    표본점 아홉 개 중 하나만 걸쳐도 받친 것으로 본다. 기초 블록 네 개 위에 선 철탑처럼
    "면적은 조금 겹치지만 제자리를 받치는" 경우가 정상이기 때문이다. 반대로 면적 비율로
    재면 그런 것까지 부양으로 잡힌다.
  */
  const solids = config.parts
    .map((p) => ({ p, st: p.st ?? 1, b: partBounds(p) }))
    .filter((q) => q.b && !DETAIL_KINDS.has(q.p.k))

  for (const q of solids) {
    if (q.b.y0 <= 0.03) continue // 지면에서 시작하는 부품
    const pts = footprint(q.p, q.b)
    const holders = solids.filter((r) => {
      if (r === q) return false
      /*
        아래에서 밑면까지 닿아 받치거나(앞 조건), 아니면 **다른 매스에 박혀 붙어 있으면**
        된다(뒤 조건). 경기장 전광판처럼 지붕에 매달린 부품은 밑에 아무것도 없는 것이
        정상이라, 밑만 보면 정상인 것을 부양으로 잡는다.
      */
      const under = r.b.y1 >= q.b.y0 - 0.02 && r.b.y0 <= q.b.y0 - 0.005
      const stuck = r.b.y1 > q.b.y0 + 0.01 && r.b.y0 < q.b.y1 - 0.01
      if (!under && !stuck) return false
      return pts.some(([x, z]) => solidAt(r.p, x, z) !== false)
    })
    if (holders.length === 0) {
      problems.push(
        `${key}: st${q.st} ${q.p.k} 이 y=${q.b.y0.toFixed(2)} 에서 시작하는데 아래에 받칠 부품이 없다 — 공중에 뜬다`,
      )
      continue
    }
    const first = Math.min(...holders.map((r) => r.st))
    if (first > q.st) {
      const who = holders.find((r) => r.st === first).p.k
      problems.push(`${key}: st${q.st} ${q.p.k} 의 받침(${who})이 st${first} 부터다 — 그 사이 단계에서 떠 있다`)
    }
  }

  /*
    9. 매몰 검사 — `panel` 만 본다.

    panel 은 두께가 없는 평면이라 표면에서 조금만 안쪽이면 아예 안 보인다. 반대로 box·기둥이
    다른 매스에 박히는 것은 정상(기둥·코니스)이라 검사하지 않는다.
  */
  for (const p of config.parts) {
    if (p.k !== 'panel') continue
    const [px, py, pz] = p.pos
    const inside = solids.find(
      (r) => py > r.b.y0 + 0.012 && py < r.b.y1 - 0.012 && solidAt(r.p, px, pz, 0.012) === true,
    )
    if (inside) {
      problems.push(
        `${key}: st${p.st ?? 1} panel [${p.pos.map((n) => n.toFixed(2)).join(', ')}] 이 ` +
          `st${inside.st} ${inside.p.k} 속에 파묻혔다 — 그리는 값은 맞지만 화면에 없다`,
      )
    }
  }

  console.log(`${key.padEnd(22)} 부품 ${String(config.parts.length).padStart(3)}개 · 높이 ${height.toFixed(2)}`)
}

// 헬퍼가 config 를 만들며 남긴 무효 호출을 실패로 올린다.
for (const w of MIRROR_NOOPS) {
  problems.push(w)
}

console.log(`\n랜드마크 ${Object.keys(LANDMARK_CONFIGS).length}종`)
if (problems.length === 0) {
  console.log('✅ 문제 없음')
} else {
  console.error(`❌ ${problems.length}건`)
  for (const p of problems) console.error('   ' + p)
  process.exitCode = 1
}
