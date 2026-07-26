/**
 * 프리미엄 테마 건물 병합 진입점.
 * 각 테마 파일의 Record<string, BuildingConfig>를 하나로 합쳐 PREMIUM_CONFIGS로 노출.
 * 렌더러(buildings.tsx)는 BUILDING_CONFIGS와 PREMIUM_CONFIGS를 합쳐(ALL_CONFIGS) 사용.
 */
import { SAKURA } from './sakura'
import { CYBER } from './cyber'
import { SEOUL } from './seoul'
import { WEST } from './west'
import { MEDIEVAL } from './medieval'
import { SANTORINI } from './santorini'
import { SCIFI } from './scifi'
import { TROPICAL } from './tropical'
import { NORDIC } from './nordic'
import { STEAMPUNK } from './steampunk'
import { EGYPT } from './egypt'
import { ARTDECO } from './artdeco'

export const PREMIUM_CONFIGS = {
  ...SAKURA,
  ...CYBER,
  ...SEOUL,
  ...WEST,
  ...MEDIEVAL,
  ...SANTORINI,
  ...SCIFI,
  ...TROPICAL,
  ...NORDIC,
  ...STEAMPUNK,
  ...EGYPT,
  ...ARTDECO,
}

export type PremiumKey = keyof typeof PREMIUM_CONFIGS

export interface PremiumTheme {
  id: string
  label: string
  keys: string[]
}

/** 뷰어 그룹핑용 테마 메타 (표시 순서 = 배열 순서). */
export const PREMIUM_THEMES: PremiumTheme[] = [
  { id: 'sakura', label: '🌸 벚꽃', keys: Object.keys(SAKURA) },
  { id: 'cyber', label: '🌃 사이버펑크', keys: Object.keys(CYBER) },
  { id: 'seoul', label: '🏙 서울', keys: Object.keys(SEOUL) },
  { id: 'west', label: '🤠 서부', keys: Object.keys(WEST) },
  { id: 'medieval', label: '🏰 중세', keys: Object.keys(MEDIEVAL) },
  { id: 'santorini', label: '🇬🇷 산토리니', keys: Object.keys(SANTORINI) },
  { id: 'scifi', label: '🚀 SF 콜로니', keys: Object.keys(SCIFI) },
  { id: 'tropical', label: '🏝 열대 리조트', keys: Object.keys(TROPICAL) },
  { id: 'nordic', label: '❄️ 노르딕', keys: Object.keys(NORDIC) },
  { id: 'steampunk', label: '⚙️ 스팀펑크', keys: Object.keys(STEAMPUNK) },
  { id: 'egypt', label: '🏜 이집트', keys: Object.keys(EGYPT) },
  { id: 'artdeco', label: '🎭 아르데코', keys: Object.keys(ARTDECO) },
]

/** UI 목록용: [key, label, themeId] */
export const PREMIUM_LIST: { key: string; label: string; themeId: string }[] =
  PREMIUM_THEMES.flatMap((t) =>
    t.keys.map((key) => ({ key, label: PREMIUM_CONFIGS[key as PremiumKey].label, themeId: t.id })),
  )
