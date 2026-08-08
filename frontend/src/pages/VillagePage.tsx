import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Scene } from '../village/Scene'
import { useStore } from '../data/store'
import type { OwnedBuilding as ModelOwnedBuilding, Sheet as ModelSheet } from '../data/types'
import { TERRAIN_LABEL } from '../data/types'
import { toMandalartFromModel } from '../village/mandalart'
import { CENTER_BLOCK_INDEX, PITCH } from '../village/layout'
import { AUTO_CELL, type CellOverride } from '../village/GrowableObject'
import { AUTO_LANDMARK, type LandmarkOverride } from '../village/Landmark'
import { BUILD_PANEL_WIDTH, BuildPanel } from '../village/BuildPanel'
import { BackdropLayer } from '../village/BackdropLayer'
import { BackdropPicker } from '../village/BackdropPicker'
import { NO_BACKDROP, backdropThumb, findBackdrop, useBackdrop } from '../village/backdrops'
import { findTerrainSkin } from '../village/terrain/skins'
import { skyGradientCss } from '../village/SkyBackdrop'
import { useIsoCamera } from '../village/IsoCamera'
import { ThumbnailBakery } from '../village/thumbnailBaker'
import { buildOwnedCatalog } from '../village/ownedCatalog'
import type { OwnedBuilding, Terrain, VillageData } from '../village/villageApi'
import { TERRAINS } from '../village/villageApi'
import { ALL_CONFIGS } from '../village/localCatalog'
import { useAutoTour } from '../features/tour/TourProvider'
import Button from '../components/common/ActionButton'
import { Badge, EmptyState, ErrorState, Segmented, Skeleton } from '../components/common/Primitives'
import { useToast } from '../components/common/Toast'

/**
 * 보유 건물에 3D 부품을 붙인다.
 *
 * <p>서버 응답에도 `parts` 가 들어 있지만, 프론트에 같은 카탈로그가 이미 있어서
 * (`localCatalog` — 기본 15종 + 프리미엄 241종 + 랜드마크) 여기서 붙인다.
 * 덕분에 <b>목업 모드에서도 마을이 그려진다</b> — 백엔드가 없으면 parts 를 받을 길이 없다.
 *
 * <p>로컬에 모델이 없는 key 는 그릴 수단이 없으므로 버린다.
 */
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

const FACING_LABEL = ['남동', '남서', '북서', '북동'] as const

/**
 * 마을 화면.
 *
 * <p><b>3D 위에 얹는 UI 는 반드시 캔버스 컨테이너 기준(`absolute`)이어야 한다.</b>
 *
 * <p>예전 규칙은 "3D 위에는 아무 UI 도 얹지 않는다" 였다. 타이틀·도메인 패널·지형 스위처가
 * 캔버스 위에 떠 있다가 셸 안으로 들어오면서 서로 겹치고 잘려 화면이 뭉개졌기 때문인데,
 * <b>원인은 오버레이가 아니라 좌표계</b>였다 — 화면(vw/vh) 기준이라 셸 크기가 바뀌면 같이
 * 어긋났다. 그래서 규칙을 "얹지 않는다" 에서 "컨테이너 기준으로 얹는다" 로 좁혔다.
 *
 * <p>지금 얹혀 있는 것은 건물 배치 패널({@link BuildPanel}) 하나다. 캔버스 `section` 이
 * `relative`·`overflow-hidden` 이고 패널이 `absolute inset` 이라 셸 크기와 무관하다.
 * 시점·확대·지형은 그대로 캔버스 <b>아래</b> 바에 있다 — 마을을 가릴 이유가 없다.
 *
 * <p>패널이 마을을 덮는 만큼은 카메라가 절두체를 옮겨 비켜 준다(`occludedLeft`). 그래서
 * 패널을 열고 닫을 때 마을이 부드럽게 미끄러진다.
 */
export default function VillagePage() {
  const { gateway, sheets: sheetList, details, setTerrain: saveTerrain } = useStore()
  const toast = useToast()
  const camera = useIsoCamera()

  const [sheet, setSheet] = useState<ModelSheet | 'none' | null>(null)
  const [village, setVillage] = useState<VillageData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  /** 지금 편집 중인 블록(0~8). 중앙(4)은 랜드마크 자리라 건물을 놓지 않는다. */
  const [block, setBlock] = useState(CENTER_BLOCK_INDEX)
  /** 편집 중인 칸의 task id. null 이면 아직 고르지 않은 상태. */
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const [overrides, setOverrides] = useState<Record<string, CellOverride>>({})
  const [landmark, setLandmark] = useState<LandmarkOverride>(AUTO_LANDMARK)
  /**
   * 중앙 랜드마크 칸의 격자 좌표.
   *
   * <p>서버가 `SheetService.createSheet` 에서 정하는 자리(현재 5·5)를 여기 적어두지 않고
   * 배치 응답에서 받아 기억한다 — 좌표 규칙을 프론트에 복제하면 서버가 자리를 옮길 때
   * 조용히 엉뚱한 칸에 저장된다. 못 받았으면 저장을 건너뛴다.
   */
  const [landmarkSpot, setLandmarkSpot] = useState<{
    domainPosition: number
    itemPosition: number
  } | null>(null)

  /**
   * 건물 배치 패널을 펼쳤는지. **기본 열림** — 건물 배치가 이 페이지의 목적이라, 닫혀 있으면
   * 기능이 있는 줄 모른다. 마을을 온전히 보고 싶을 때 접으면 마을이 중앙으로 돌아온다.
   */
  const [panelOpen, setPanelOpen] = useState(true)

  const [terrainPending, setTerrainPending] = useState<Terrain | null>(null)

  /**
   * 캔버스 뒤에 깔 배경 사진. 시트마다 따로 기억한다 — 자세한 이유는 {@link useBackdrop}.
   *
   * <p>시트가 아직 안 정해졌으면 null 을 넘긴다. 그동안은 기본(사진 없음)이고, 정해지는
   * 순간 저장해 둔 것이 들어온다.
   */
  const [backdrop, setBackdrop] = useBackdrop(sheet && sheet !== 'none' ? sheet.id : null)
  const [backdropOpen, setBackdropOpen] = useState(false)
  /** 지금 배경이 데려온 지형. 배경이 없으면 null 이고 그때만 지형을 직접 고를 수 있다. */
  const terrainSkin = findTerrainSkin(backdrop === NO_BACKDROP ? null : backdrop)
  /** 'now' = 지금 진행도, 'done' = 다 채웠을 때의 모습. */
  const [preview, setPreview] = useState<'now' | 'done'>('now')
  const [themeFilter, setThemeFilter] = useState<string>('all')

  const mandalart = useMemo(
    () => (sheet && sheet !== 'none' ? toMandalartFromModel(sheet) : null),
    [sheet],
  )

  /*
    마을이 <b>그려진 뒤에</b> 안내를 띄운다.

    그 전까지 이 화면은 스켈레톤 두 장(`Skeleton`)이라 가리킬 것이 하나도 없다 — 캔버스도,
    배치 패널도, 아래 조작 바도 아직 없으므로 모든 단계가 가운데 카드로 물러나거나
    `requireTarget` 에 걸려 빠진다. 만다라트가 없는 사람(`sheet === 'none'`)은 빈 화면만
    보게 되므로 여기서도 걸러진다.
  */
  useAutoTour('village', { ready: Boolean(mandalart && village) })

  /**
   * 어느 시트의 마을을 볼지.
   *
   * `?sheet=` 로 지정할 수 있고, 없으면 가장 최근 것을 쓴다. 상세(도메인·과제)는 스토어가
   * 이미 받아 둔 캐시를 먼저 보고, 없을 때만 직접 부른다.
   */
  useEffect(() => {
    const wanted = Number(new URLSearchParams(window.location.search).get('sheet'))
    let alive = true

    const pick = async () => {
      const list = sheetList.data.length > 0 ? sheetList.data : await gateway.listSheets()
      if (!alive) return

      if (list.length === 0) {
        setSheet('none')
        return
      }

      const targetId = list.some((s) => s.id === wanted) ? wanted : list[0].id
      const cached = details.data[targetId]
      if (cached?.domains) {
        setSheet(cached)
        return
      }

      const detail = await gateway.sheetDetail(targetId)
      if (alive) setSheet(detail)
    }

    pick().catch((e: unknown) => {
      if (alive) setLoadError(e instanceof Error ? e.message : '만다라트를 불러오지 못했습니다.')
    })

    return () => {
      alive = false
    }
  }, [gateway, sheetList.data, details.data])

  /** 마을(지형 + 보유 건물)은 시트가 정해진 뒤 받는다. 서버 경로가 시트별이다. */
  useEffect(() => {
    if (!sheet || sheet === 'none') return
    const sheetId = sheet.id
    let alive = true

    Promise.all([gateway.village(sheetId), gateway.ownedBuildings(sheetId)])
      .then(([info, owned]) => {
        if (!alive) return
        setVillage({
          terrain: info.terrain,
          buildings: owned.map(withParts).filter(Boolean) as OwnedBuilding[],
        })
      })
      .catch(
        (e: unknown) =>
          alive && setLoadError(e instanceof Error ? e.message : '마을을 불러오지 못했습니다.'),
      )

    return () => {
      alive = false
    }
  }, [sheet, gateway])

  /**
   * 서버에 저장된 배치를 3D 가 읽는 형태로 옮긴다.
   *
   * <p>서버는 "격자 좌표 → 건물"로 저장하고, 3D 는 "task id → 건물"로 그린다.
   * 응답에 `subjectId` 가 함께 오므로 그걸로 이어 붙인다.
   *
   * <p><b>중앙 랜드마크 칸은 이 규칙에서 빠진다.</b> 과제에 매달린 칸이 아니라 `subjectId` 가
   * 없어서, task id 로 잇는 위 규칙에 걸리지 않는다. 그래서 `isLandmarkSlot` 로 따로 집어
   * `landmark` 로 넘긴다 — 이걸 빼면 서버에 무엇을 저장해도 화면은 보유 목록 첫 종을 그린다.
   */
  useEffect(() => {
    if (!sheet || sheet === 'none') return
    let alive = true

    gateway
      .villageLayout(sheet.id)
      .then((layout) => {
        if (!alive) return
        const next: Record<string, CellOverride> = {}
        let center: LandmarkOverride = AUTO_LANDMARK
        let centerSpot: { domainPosition: number; itemPosition: number } | null = null

        for (const spot of layout.spots) {
          if (spot.isLandmarkSlot) {
            centerSpot = { domainPosition: spot.domainPosition, itemPosition: spot.itemPosition }
            // itemKey 가 없으면 아직 고르지 않은 것 — 'auto' 로 두어 보유 첫 종이 선다.
            // 표시 단계는 서버가 저장하지 않는다(진행률에서 계산되므로) 늘 'auto' 다.
            if (spot.itemKey) center = { building: spot.itemKey, stage: 'auto' }
            continue
          }
          if (spot.subjectId != null && spot.itemKey) {
            next[String(spot.subjectId)] = {
              building: spot.itemKey,
              stage: 'auto',
            }
          }
        }

        setOverrides(next)
        setLandmark(center)
        setLandmarkSpot(centerSpot)
      })
      // 배치를 못 받아도 마을은 진행률만으로 그릴 수 있다. 화면 전체를 막지 않는다.
      .catch(() => undefined)

    return () => {
      alive = false
    }
  }, [sheet, gateway])

  const catalog = useMemo(() => buildOwnedCatalog(village?.buildings ?? []), [village])

  /**
   * 3D 에 실제로 넘길 만다라트.
   *
   * <p>완성형 미리보기는 <b>진행률만 100 으로 바꾼 사본</b>이다. 건물 단계도, 블록의
   * 도시화도, 랜드마크 단계도 전부 진행률에서 계산되므로(`progressStage`·`urbanLevelOf`·
   * `landmarkStageOf`) 여기 한 곳만 바꾸면 마을 전체가 완성된 모습으로 그려진다.
   * 렌더러에 "미리보기 모드" 같은 분기를 심지 않아도 된다.
   *
   * <p>사본이라 서버 데이터는 건드리지 않는다 — 껐다 켜면 원래 진행도로 돌아온다.
   */
  const shown = useMemo(() => {
    if (!mandalart || preview === 'now') return mandalart
    return {
      ...mandalart,
      domains: mandalart.domains.map((d) => ({
        ...d,
        tasks: d.tasks.map((t) => ({ ...t, progress: 100 })),
      })),
    }
  }, [mandalart, preview])

  /**
   * 3D 에 넘길 랜드마크 설정.
   *
   * <p>완성형 미리보기에서는 <b>표시 단계 override 를 무시한다.</b> `shown` 이 진행률을 100 으로
   * 올려도 `override.stage` 가 숫자면 `Landmark` 가 그 값을 먼저 보므로, "완성형" 을 켰는데
   * 랜드마크만 예전 단계로 남는다. 8칸 오브젝트는 stage override 를 쓰는 곳이 없어(`place` 는
   * building 만 바꾼다) 이 어긋남이 랜드마크에서만 생긴다.
   *
   * <p>끄면 고른 단계로 돌아온다 — 사본만 바꾸고 `landmark` 는 건드리지 않기 때문이다.
   */
  const shownLandmark = useMemo<LandmarkOverride>(
    () => (preview === 'done' ? { ...landmark, stage: 'auto' } : landmark),
    [landmark, preview],
  )

  /**
   * 카메라가 바라볼 지점 — 확대할수록 고른 세부 목표 쪽으로 옮겨 간다.
   *
   * <p>'멀리'는 마을 전체가 화면에 들어오므로 중심을 본다. 하지만 '가까이'에서는 블록
   * 하나 남짓만 보이는데 계속 중심만 보고 있으면 정작 고른 블록이 화면 밖이라
   * 확대 자체가 쓸모없어진다. 그래서 단계에 비례해 시선을 옮긴다.
   *
   * <p>이 지점은 <b>회전의 축</b>이기도 하다. 카메라가 이 점을 중심으로 도므로, 도메인을
   * 골라 확대한 상태에서 돌리면 그 블록을 축으로 돈다. 예전에는 단계별로 0.55 만큼만
   * 끌어서 축이 마을 중심도 블록 중심도 아닌 어중간한 곳에 놓였고, 돌릴 때 블록이
   * 화면을 크게 휩쓸며 지나가 어지러웠다.
   *
   * <p>'보통'에서도 끝까지 옮기지만 28 단위가 보이므로 이웃 블록은 그대로 시야에 남는다.
   */
  const FOCUS_PULL = [0, 1, 1] as const
  const focus = useMemo<[number, number, number]>(() => {
    const pull = FOCUS_PULL[camera.zoom]
    const gx = (block % 3) - 1
    const gz = Math.floor(block / 3) - 1
    return [gx * PITCH * pull, 2, gz * PITCH * pull]
  }, [block, camera.zoom])

  /**
   * 칸에 건물을 세운다.
   *
   * <p>화면에 먼저 반영하고 서버에 보낸다. 3D 는 즉시 바뀌어야 "눌렀다"는 느낌이 나는데,
   * 왕복을 기다리면 몇백 ms 동안 아무 일도 안 일어난 것처럼 보인다.
   */
  const place = useCallback(
    async (taskId: string, itemKey: string | 'auto') => {
      setOverrides((prev) => ({
        ...prev,
        [taskId]: { ...(prev[taskId] ?? AUTO_CELL), building: itemKey },
      }))

      if (!sheet || sheet === 'none') return

      // 서버 배치는 격자 좌표를 받는다. task id(subjectId)로 그 칸을 찾는다.
      try {
        const layout = await gateway.villageLayout(sheet.id)
        const spot = layout.spots.find((s) => String(s.subjectId) === taskId)
        if (!spot) return

        const owned = catalog.list.find((b) => b.itemKey === itemKey)
        await gateway.placeBuilding(
          sheet.id,
          spot.domainPosition,
          spot.itemPosition,
          itemKey === 'auto' ? null : (owned?.invenId ?? null),
        )
      } catch {
        // 저장에 실패해도 화면은 그대로 둔다 — 되돌리면 사용자가 무엇을 눌렀는지 잃는다.
      }
    },
    [sheet, gateway, catalog],
  )

  /**
   * 정중앙에 세울 랜드마크를 고른다.
   *
   * <p>칸이 하나뿐이라 `place` 처럼 task id 로 자리를 찾을 필요가 없다 — 좌표는 배치 응답에서
   * 이미 받아 뒀다(`landmarkSpot`). 서버는 이 자리에 LANDMARK 만 받는다
   * (`ITEM_SPOT_LANDMARK_ONLY`).
   *
   * <p><b>실패하면 되돌리고 알린다.</b> 8칸(`place`)은 저장이 실패해도 화면을 그대로 두는데,
   * 그쪽 근거는 "되돌리면 사용자가 무엇을 눌렀는지 잃는다" 였다. 랜드마크에서는 그 근거가
   * 성립하지 않는다 — 저장이 안 됐으면 새로고침이 어차피 되돌리므로, 화면만 그대로 두면
   * <b>지금은 거짓을 보여주고 나중에 잃는다</b>. 되돌리는 쪽이 잃는 것이 같고 정직하다.
   * 대신 왜 되돌아갔는지 토스트로 말해 준다.
   *
   * <p>좌표를 아직 못 받았으면(배치 조회 실패) 여기서 한 번 더 받아 본다. 조용히 건너뛰면
   * 화면은 바뀌는데 저장은 안 되는 정확히 그 상태가 된다.
   */
  const placeLandmark = useCallback(
    async (itemKey: string | 'auto') => {
      if (!sheet || sheet === 'none') return

      const previous = landmark
      setLandmark((prev) => ({ ...prev, building: itemKey }))

      try {
        let spot = landmarkSpot
        if (!spot) {
          const layout = await gateway.villageLayout(sheet.id)
          const found = layout.spots.find((s) => s.isLandmarkSlot)
          if (!found) throw new Error('중앙 랜드마크 자리를 찾을 수 없습니다.')
          spot = { domainPosition: found.domainPosition, itemPosition: found.itemPosition }
          setLandmarkSpot(spot)
        }

        // 'auto' 는 칸을 비우는 것(invenId=null)이다 — 비운 칸에는 보유 목록 첫 종이 선다.
        const owned =
          itemKey === 'auto' ? null : catalog.landmarks.find((b) => b.itemKey === itemKey)
        if (itemKey !== 'auto' && !owned) throw new Error('보유하지 않은 랜드마크입니다.')

        await gateway.placeBuilding(
          sheet.id,
          spot.domainPosition,
          spot.itemPosition,
          owned?.invenId ?? null,
        )
      } catch (e: unknown) {
        setLandmark(previous)
        toast.show({
          tone: 'warn',
          title: '랜드마크를 저장하지 못했어요',
          body: e instanceof Error ? e.message : '잠시 후 다시 시도해 주세요.',
        })
      }
    },
    [sheet, gateway, catalog, landmarkSpot, landmark, toast],
  )

  const changeTerrain = async (terrain: Terrain) => {
    if (!village || village.terrain === terrain) return
    if (!sheet || sheet === 'none') return

    const previous = village.terrain
    setTerrainPending(terrain)
    setVillage({ ...village, terrain })

    const ok = await saveTerrain(sheet.id, terrain)
    if (!ok) setVillage((prev) => (prev ? { ...prev, terrain: previous } : prev))
    setTerrainPending(null)
  }

  /* ───────── 상태 화면 ───────── */

  if (loadError) {
    return <ErrorState message={loadError} onRetry={() => window.location.reload()} />
  }

  if (sheet === 'none') {
    return (
      <div className="card">
        <EmptyState
          icon="🏙️"
          title="아직 지을 마을이 없어요"
          body="만다라트를 만들면 과제 하나마다 건물 자리가 생기고, 그 위에 도시가 세워집니다."
          action={<Button to="/app/sheets/new">만다라트 만들기</Button>}
        />
      </div>
    )
  }

  if (!mandalart || !village) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[46vh] min-h-[320px] w-full" />
        <Skeleton className="h-[220px] w-full" />
      </div>
    )
  }

  return (
    /*
      `lg:min-h-0 lg:flex-1` — AppShell 이 이 경로에서만 본문을 `h-dvh flex flex-col` 로 두므로,
      여기서 그 높이를 받아 채운다. 아래 캔버스가 `flex-1` 로 남은 만큼 가져간다.
    */
    <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <ThumbnailBakery />

      {/* 기존 이동 버튼의 높이는 유지해 고정 헤더와 3D 영역이 겹치지 않게 한다. */}
      <div aria-hidden="true" className="h-9 shrink-0" />

      {/* ───────── 3D 뷰 + 건물 배치 오버레이 ───────── */}
      {/*
        캔버스가 <b>남은 높이를 전부</b> 가져간다(`flex-1`).

        예전에는 `100dvh - 228px` 처럼 뺄셈으로 맞췄다. 그러면 아래 요소 높이를 하나라도 잘못
        세는 순간 그만큼 어긋나 미세하게 스크롤된다 — 실제로 조작 바의 `card` 테두리 2px 과
        이동 버튼의 `h-11`(기본 size 는 md 다, sm 이 아니다)을 놓쳤다. 두 번 고쳐도 또 남았다.

        지금은 AppShell 이 본문을 `h-dvh flex flex-col` 로 두고 여기가 `flex-1` 로 나머지를
        받는다. <b>산수가 없으므로 어긋날 곳도 없다</b> — 뒤로 버튼·조작 바·이동 버튼이 얼마든
        브라우저가 정확히 남은 만큼을 준다.

        `min-h-[360px]` 는 창이 아주 낮을 때의 하한이다. 그때는 넘쳐서 스크롤되지만(스크롤바는
        숨겨도 휠은 듣는다) 캔버스가 0 으로 붕괴하는 것보다 낫다.

        모바일(lg 아래)에서는 AppShell 이 높이를 고정하지 않으므로 예전처럼 dvh 로 잡는다.
      */}
      <section
        /*
          인라인 `height` 를 쓰지 않는다 — flex-basis 와 height 중 무엇이 이기는지가 미묘해서,
          `lg:flex-1` 이 확실히 먹도록 `lg:h-auto` 로 명시적으로 넘긴다.
        */
        data-tour="village-canvas"
        className="card relative h-[clamp(360px,calc(100dvh-228px),1000px)] min-h-[360px] overflow-hidden p-0 lg:h-auto lg:min-h-0 lg:flex-1"
      >
        {/*
          ⚠️ 배경 사진은 <b>`Scene` 보다 위에</b> 적는다. 둘 다 이 `section` 의 형제이고
          R3F 캔버스 래퍼가 `position: relative` 라, DOM 순서가 그대로 겹침 순서가 된다.
          아래로 내리면 사진이 마을을 덮는다.
        */}
        <BackdropLayer backdrop={backdrop} />

        <Scene
          mandalart={shown ?? mandalart}
          selected={block}
          overrides={overrides}
          themes={{}}
          terrain={village.terrain}
          catalog={catalog}
          selectedTaskId={selectedTask}
          landmark={shownLandmark}
          backdrop={backdrop}
          cameraRef={camera.ref}
          initialZoom={camera.zoom}
          onFacingChange={camera.setFacing}
          focus={focus}
          /*
            패널이 덮은 폭을 카메라에 알린다. 마을이 남은 영역 중앙으로 미끄러진다.
            좌우 여백(left-4)까지 더해야 실제로 가려지는 폭이 된다.
          */
          occludedLeft={panelOpen ? BUILD_PANEL_WIDTH + 32 : 0}
          onSelect={(i) => {
            if (i < 0) return
            setBlock(i)
            setSelectedTask(null)
          }}
          onSelectTask={setSelectedTask}
        />

        {/*
          3D 위 UI.

          예전 주석은 "3D 위에는 아무 UI 도 얹지 않는다" 였다. 그때 걷어낸 이유는 오버레이
          자체가 아니라 <b>좌표가 화면(vw/vh) 기준</b>이라 셸 안으로 들어오면서 서로 겹치고
          잘렸던 것이다. 이 패널은 이 `section`(relative) 기준 `absolute` 라 셸 크기와
          무관하고, `overflow-hidden` 이 삐져나감도 막는다.

          패널을 클릭해도 블록 선택이 풀리지 않는다 — Scene 의 `onPointerMissed` 는 캔버스
          이벤트라, 형제 DOM 인 패널의 클릭은 캔버스에 닿지 않는다.
        */}
        {panelOpen ? (
          <BuildPanel
            mandalart={mandalart}
            catalog={catalog}
            block={block}
            onBlockChange={setBlock}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            overrides={overrides}
            onPlace={(taskId, itemKey) => void place(taskId, itemKey)}
            themeFilter={themeFilter}
            onThemeFilter={setThemeFilter}
            landmark={landmark}
            onPlaceLandmark={(itemKey) => void placeLandmark(itemKey)}
            preview={preview}
            onClose={() => setPanelOpen(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="card absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2.5 text-[13px] font-extrabold shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <span aria-hidden="true">🏗</span>
            건물 배치
          </button>
        )}

        {sheet && (
          <Link
            to={`/app/sheets/${sheet.id}`}
            data-tour="village-sheet"
            className="card absolute top-4 right-4 z-10 flex items-center px-4 py-2.5 text-[13px] font-extrabold no-underline shadow-lg transition-transform hover:-translate-y-0.5"
          >
            만다라트 보기
          </Link>
        )}
      </section>

      {/* ───────── 시점 · 지형 ───────── */}
      <section className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        {/*
          시점과 확대를 <b>한 껍데기로 묶는다.</b> 둘 다 "지금 어디서 보고 있는가" 하나를
          다루는 짝이라 안내도 한 단계로 짚는데, 표적(`data-tour`)은 요소 하나만 가리킬 수
          있기 때문이다. 껍데기가 부모와 같은 flex 규칙을 그대로 쓰므로 배치는 달라지지 않는다.
        */}
        <div data-tour="village-camera" className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="muted text-[12px] font-bold">시점</span>
            <button
              type="button"
              onClick={camera.rotateCCW}
              aria-label="왼쪽으로 90도 돌리기"
              className="grid size-9 place-items-center rounded-full border text-[15px]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              ↺
            </button>
            <span className="muted min-w-[34px] text-center text-[11.5px] font-black">
              {FACING_LABEL[camera.facing % 4]}
            </span>
            <button
              type="button"
              onClick={camera.rotateCW}
              aria-label="오른쪽으로 90도 돌리기"
              className="grid size-9 place-items-center rounded-full border text-[15px]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              ↻
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="muted text-[12px] font-bold">확대</span>
            <Segmented
              size="sm"
              value={String(camera.zoom)}
              onChange={(v) => camera.changeZoom(Number(v) as 0 | 1 | 2)}
              options={[
                { value: '0', label: '멀리' },
                { value: '1', label: '보통' },
                { value: '2', label: '가까이' },
              ]}
            />
          </div>
        </div>

        <div data-tour="village-preview" className="flex items-center gap-2">
          <span className="muted text-[12px] font-bold">보기</span>
          <Segmented
            size="sm"
            value={preview}
            onChange={(v) => setPreview(v as 'now' | 'done')}
            options={[
              { value: 'now', label: '현재' },
              { value: 'done', label: '완성형' },
            ]}
          />
        </div>

        {/*
          배경이 켜져 있으면 지형은 <b>고르는 것이 아니라 배경에 딸려 오는 것</b>이다.
          그때도 네 칸짜리 토글을 남겨 두면, 눌러도 화면이 안 바뀌는 버튼이 된다 —
          실제로 그려지는 지표면은 배경 쪽 설정이기 때문이다. 그래서 이름표로 바꾼다.
          네 종으로 돌아가려면 배경을 '기본'으로 두면 된다.
        */}
        <div data-tour="village-terrain" className="flex items-center gap-2">
          <span className="muted text-[12px] font-bold">지형</span>
          {terrainSkin ? (
            <span
              title="배경에 딸린 지형입니다. 직접 고르려면 배경을 '기본'으로 두세요."
              className="flex h-8 items-center rounded-full px-3 text-[12.5px] font-bold text-[var(--text-strong)]"
              style={{ background: 'var(--surface-sunken)' }}
            >
              {terrainSkin.name}
            </span>
          ) : (
            <Segmented
              size="sm"
              value={village.terrain}
              onChange={(v) => void changeTerrain(v as Terrain)}
              options={TERRAINS.map((t) => ({
                value: t,
                label: TERRAIN_LABEL[t],
              }))}
            />
          )}
          {terrainPending && <span className="muted text-[11px] font-bold">저장 중…</span>}
        </div>

        {/*
          배경은 지형 옆에 둔다 — 둘 다 "마을을 어디에 놓을 것인가"라서 함께 만지는 짝이다.

          지형처럼 `Segmented` 로 늘어놓지 않는다. 열한 칸이 이 바를 두 줄로 밀어내는 데다
          '벚꽃'·'노르딕' 같은 이름만으로는 무엇이 나올지 알 수 없어서, 어차피 그림을 봐야
          고를 수 있다. 지금 고른 것을 작은 그림으로 물고 있는 버튼 하나로 줄이고 나머지는
          모달에 담았다.
        */}
        <div className="flex items-center gap-2">
          <span className="muted text-[12px] font-bold">배경</span>
          <button
            type="button"
            onClick={() => setBackdropOpen(true)}
            title="3D 마을 뒤에 깔 배경 고르기 — 지형도 그림에 맞춰 함께 바뀝니다"
            className="flex h-9 items-center gap-2 rounded-full border py-0 pr-3.5 pl-1.5 text-[12px] font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span
              aria-hidden="true"
              className="block h-6 w-9 shrink-0 rounded-full border bg-cover bg-center"
              style={{
                borderColor: 'var(--border-hairline)',
                /*
                  `background` 축약형을 쓰지 않는다 — 뒤에 오는 backgroundImage 를 덮을지가
                  적는 순서에 달리게 된다. 사진을 안 쓰면 지금 지형의 하늘색을 그대로 보여 준다.
                */
                backgroundColor: findBackdrop(backdrop)?.tint,
                backgroundImage:
                  backdrop === NO_BACKDROP
                    ? skyGradientCss(village.terrain)
                    : `url(${backdropThumb(backdrop)})`,
              }}
            />
            {findBackdrop(backdrop)?.label ?? '기본'}
          </button>
        </div>

        {/*
          길을 잃었을 때 돌아올 곳. 돌리고 확대하다 보면 지금 어디를 보고 있는지
          알 수 없게 되는데, 그때 버튼 하나로 처음 상태(남동쪽·마을 전체)로 돌아온다.
          시선은 확대가 '멀리'로 내려가면서 마을 중심으로 따라온다.
        */}
        <button
          type="button"
          onClick={camera.reset}
          title="방향과 확대를 처음 상태로"
          className="flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <span aria-hidden="true">⌖</span>
          원위치로
        </button>

        {/*
          완성형일 때는 그렇다고 알린다. 3D 만 바뀌고 아래 패널의 진행률 막대는 실제 값
          그대로라, 표시가 없으면 마을과 숫자가 어긋나 보인다.
        */}
        {preview === 'done' && <Badge tone="brand">모든 과제를 마쳤을 때의 모습</Badge>}

        <span className="muted ml-auto truncate text-[11.5px] font-semibold">
          {mandalart.center}
        </span>
      </section>

      {/*
        배경을 고르면 지형도 그 배경에 맞는 것으로 함께 바꾼다.

        <p>마을 받침판이 그림의 빈 자리를 거의 덮으므로 화면에 남는 것은 <b>바깥 풍경</b>인데,
        사막 그림 위에 아스팔트 섬이 떠 있으면 두 그림이 따로 논다. 짝은 배경마다 정해 뒀다
        ({@link BACKDROPS} 의 `terrain`).

        <p><b>고를 때만 바꾼다 — 화면에 들어올 때는 바꾸지 않는다.</b> 저장해 둔 배경을 되살릴
        때마다 지형까지 덮어쓰면, 배경을 고른 뒤에 지형만 따로 바꿔 둔 사람은 들어올 때마다
        그 선택을 잃는다. 아래 지형 버튼은 그대로 살아 있으므로 마음에 안 들면 바꾸면 된다.
      */}
      <BackdropPicker
        open={backdropOpen}
        value={backdrop}
        terrain={village.terrain}
        onChange={(next) => {
          setBackdrop(next)
          // 짝은 지형 쪽이 정본이다({@link TERRAIN_SKINS} 의 `base`) — 배경 목록에도 적어 두면
          // 두 표가 갈라져, 어느 쪽을 고쳤는지에 따라 화면과 저장값이 어긋난다.
          const paired = findTerrainSkin(next)?.base
          if (paired) void changeTerrain(paired)
        }}
        onClose={() => setBackdropOpen(false)}
      />
    </div>
  )
}
