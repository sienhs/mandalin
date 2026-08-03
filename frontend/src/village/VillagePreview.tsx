import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Scene } from './Scene'
import { toMandalartFromModel } from './mandalart'
import { buildOwnedCatalog } from './ownedCatalog'
import { AUTO_LANDMARK } from './Landmark'
import { ALL_CONFIGS } from './localCatalog'
import type { CellOverride } from './GrowableObject'
import type { OwnedBuilding, VillageData } from './villageApi'
import { useStore } from '../data/store'
import type { OwnedBuilding as ModelOwnedBuilding, Sheet as ModelSheet } from '../data/types'
import { Skeleton } from '../components/common/Primitives'
import { cn } from '../utils/cn'

/**
 * 마을을 보여 주기만 하는 화면. 홈 카드처럼 "지금 내 마을이 어떻게 생겼나"만 필요한 곳에 쓴다.
 *
 * <p><b>왜 스크린샷을 찍어 S3 에 올리지 않는가.</b> 그 방식은 캡처 → 업로드 API → S3 쓰기 권한
 * → 건물을 바꿀 때마다 무효화, 이렇게 네 군데가 맞물려야 하고, 그중 하나만 어긋나도 사용자는
 * <i>낡은 마을</i>을 보게 된다. 틀린 그림을 보여 주는 건 안 보여 주는 것보다 나쁘다.
 * 실제로 그려 버리면 항상 지금 상태이고, 어긋날 구석 자체가 없다.
 *
 * <p>대신 <b>비용을 깎는다.</b> 그림자·디테일 부품·섬 아래 암반을 모두 끄면 draw call 이
 * 1,000 대에서 600 대로 떨어진다. 홈은 마을을 살펴보는 화면이 아니라 흘깃 보는 화면이라
 * 이 정도 디테일로 충분하다.
 *
 * <p><b>그리고 한 장 찍고 캔버스를 버린다.</b> 살아 있는 캔버스를 홈에 두니 스크롤할 때
 * 화면이 뭉개졌다 — 브라우저가 스크롤 중에 합성 레이어를 재활용하는데, WebGL 표면은
 * 그 과정에서 내용이 깨져도 스스로 다시 그리지 않는다(정지 화면이라 다시 그릴 일이 없다).
 * 어차피 조작하지 않는 그림이므로, 첫 프레임을 PNG 로 떠서 `<img>` 로 바꿔 끼우면
 * 깨질 표면 자체가 사라진다. 덤으로 WebGL 컨텍스트 하나와 매 프레임 렌더가 없어진다.
 *
 * <p>찍은 그림은 sessionStorage 에 둔다. 홈은 자주 드나드는 화면이라 매번 다시 그리면
 * 그때마다 깜빡인다. 키에 지형·배치·진행률을 함께 넣어, <b>마을이 바뀌면 키도 바뀌어</b>
 * 저절로 다시 찍힌다 — 낡은 그림이 남을 수 없다.
 */
interface Props {
  sheet: ModelSheet
  className?: string
}

/** 보유 건물에 3D 부품을 붙인다. 로컬에 모델이 없는 key 는 그릴 수단이 없으므로 버린다. */
function withParts(b: ModelOwnedBuilding): OwnedBuilding | null {
  const config = ALL_CONFIGS[b.itemKey]
  if (!config) return null

  return {
    invenId: b.invenId,
    itemId: b.itemId,
    itemKey: b.itemKey,
    name: b.name,
    theme: b.theme,
    type: b.type,
    thumbnailUrl: b.thumbnailUrl,
    size: b.size,
    parts: config.parts,
  }
}

/**
 * 캔버스 안에서 몇 프레임 기다렸다가 화면을 PNG 로 넘긴다.
 *
 * <p>첫 프레임에 찍으면 안 된다 — drei `Text` 가 폰트를 비동기로 불러오고 그동안 라벨이
 * 비어 있어서, 글자 없는 마을이 찍힌다. 몇 프레임 지나면 대부분 자리를 잡는다.
 */
function Shot({ onReady }: { onReady: (dataUrl: string) => void }) {
  const { gl } = useThree()
  const frames = useRef(0)
  const fired = useRef(false)

  useFrame(() => {
    if (fired.current) return
    if (++frames.current < 12) return
    fired.current = true
    try {
      onReady(gl.domElement.toDataURL('image/png'))
    } catch {
      // toDataURL 은 오염된 캔버스에서 던진다. 그때는 캔버스를 그대로 두면 된다.
    }
  })

  return null
}

export function VillagePreview({ sheet, className }: Props) {
  const { gateway } = useStore()
  const [village, setVillage] = useState<VillageData | null>(null)
  const [overrides, setOverrides] = useState<Record<string, CellOverride>>({})

  const mandalart = useMemo(() => toMandalartFromModel(sheet), [sheet])

  /*
    지형·보유 건물·배치를 한 번에 받는다. 셋 중 하나라도 실패하면 마을을 못 그리므로
    실패는 조용히 삼키고 자리만 비워 둔다 — 홈에서 마을 하나 때문에 오류 화면을
    띄우면 정작 오늘 할 일을 못 본다.
  */
  useEffect(() => {
    let alive = true
    const id = sheet.id

    Promise.all([
      gateway.village(id),
      gateway.ownedBuildings(id),
      gateway.villageLayout(id).catch(() => null),
    ])
      .then(([info, owned, layout]) => {
        if (!alive) return

        setVillage({
          terrain: info.terrain,
          buildings: owned.map(withParts).filter(Boolean) as OwnedBuilding[],
        })

        const next: Record<string, CellOverride> = {}
        for (const spot of layout?.spots ?? []) {
          if (spot.subjectId != null && spot.itemKey) {
            next[String(spot.subjectId)] = { building: spot.itemKey, stage: 'auto' }
          }
        }
        setOverrides(next)
      })
      .catch(() => undefined)

    return () => {
      alive = false
    }
  }, [sheet.id, gateway])

  const catalog = useMemo(() => buildOwnedCatalog(village?.buildings ?? []), [village])

  /**
   * 이 마을의 지금 모습을 가리키는 키.
   *
   * <p>지형·배치·진행률이 들어간다. 건물을 바꾸거나 과제를 완료하면 값이 달라지므로
   * 캐시가 저절로 무효가 된다 — 따로 지울 시점을 관리할 필요가 없다.
   */
  const shotKey = useMemo(() => {
    const placed = Object.entries(overrides)
      .map(([k, v]) => `${k}:${v.building}`)
      .sort()
      .join(',')
    const progress = mandalart.domains
      .map((d) => d.tasks.map((t) => t.progress).join('.'))
      .join('|')
    return `village-shot:${sheet.id}:${village?.terrain ?? '-'}:${placed}:${progress}`
  }, [sheet.id, village, overrides, mandalart])

  const [shot, setShot] = useState<string | null>(null)

  /* 키가 바뀌면(=마을이 바뀌면) 캐시를 다시 보고, 없으면 다시 찍도록 비운다. */
  useEffect(() => {
    try {
      setShot(sessionStorage.getItem(shotKey))
    } catch {
      setShot(null)
    }
  }, [shotKey])

  const keep = (dataUrl: string) => {
    setShot(dataUrl)
    try {
      sessionStorage.setItem(shotKey, dataUrl)
    } catch {
      // 용량 초과 등. 저장만 실패하고 화면은 정상이다.
    }
  }

  if (!village) return <Skeleton className={className} />

  /*
    찍힌 그림이 있으면 캔버스를 아예 만들지 않는다. 이게 스크롤 뭉개짐이 사라지는 지점이다.
  */
  if (shot) {
    return <img src={shot} alt="" aria-hidden="true" className={cn(className, 'object-cover')} />
  }

  return (
    <div className={className} style={{ pointerEvents: 'none' }} aria-hidden="true">
      <Scene
        mandalart={mandalart}
        selected={null}
        overrides={overrides}
        themes={{}}
        terrain={village.terrain}
        catalog={catalog}
        selectedTaskId={null}
        landmark={AUTO_LANDMARK}
        islandBase={false}
        shadows={false}
        details={false}
        initialZoom={0}
        onSelect={() => undefined}
        onSelectTask={() => undefined}
      >
        <Shot onReady={keep} />
      </Scene>
    </div>
  )
}
