import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Scene } from '../village/Scene'
import { cn } from '../utils/cn'
import { useStore } from '../data/store'
import type { OwnedBuilding as ModelOwnedBuilding, Sheet as ModelSheet } from '../data/types'
import { TERRAIN_LABEL } from '../data/types'
import { toMandalartFromModel } from '../village/mandalart'
import { CENTER_BLOCK_INDEX, PITCH } from '../village/layout'
import { AUTO_CELL, type CellOverride } from '../village/GrowableObject'
import { AUTO_LANDMARK, type LandmarkOverride } from '../village/Landmark'
import { useIsoCamera } from '../village/IsoCamera'
import { ThumbnailBakery } from '../village/thumbnailBaker'
import { BuildingImage } from '../village/BuildingImage'
import { buildOwnedCatalog } from '../village/ownedCatalog'
import type { OwnedBuilding, Terrain, VillageData } from '../village/villageApi'
import { TERRAINS } from '../village/villageApi'
import { ALL_CONFIGS } from '../village/localCatalog'
import Button from '../components/common/ActionButton'
import {
  Badge,
  EmptyState,
  ErrorState,
  ProgressBar,
  Segmented,
  Skeleton,
  domainColor,
} from '../components/common/Primitives'
import { IconArrowLeft, IconArrowRight } from '../components/common/Icons'

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

/** 블록 인덱스(0~8, 4=중앙) → 도메인 번호(0~7). 색을 고를 때 쓴다. */
function domainIndexOf(blockIndex: number): number {
  return blockIndex < CENTER_BLOCK_INDEX ? blockIndex : blockIndex - 1
}

const FACING_LABEL = ['남동', '남서', '북서', '북동'] as const

/**
 * 어디서 마을로 들어왔는지에 따라 돌아갈 곳.
 *
 * <p>보낸 쪽이 `state.from` 에 자기 경로를 적어 준다. `navigate(-1)` 로 대신하지 않는
 * 이유는, 마을 안에서 시트를 바꾸거나 새로고침하면 히스토리가 한 칸씩 어긋나 엉뚱한
 * 곳으로 돌아가기 때문이다. 어디서 왔는지는 보낸 쪽이 가장 잘 안다.
 *
 * <p>모르는 경로로 들어왔으면(주소창 직접 입력, 사이드바) 홈으로 보낸다 —
 * 없는 곳으로 되돌리는 것보다 늘 있는 곳으로 보내는 편이 안전하다.
 */
const BACK_TO: Record<string, { to: string; label: string }> = {
  '/app': { to: '/app', label: '홈으로' },
  '/app/sheets': { to: '/app/sheets', label: '내 만다라트로' },
  '/app/shop': { to: '/app/shop', label: '상점으로' },
}

function backTarget(from: unknown): { to: string; label: string } {
  if (typeof from !== 'string') return BACK_TO['/app']
  // 상세(/app/sheets/12)에서 왔으면 그 상세로 정확히 돌려보낸다.
  if (/^\/app\/sheets\/\d+$/.test(from)) return { to: from, label: '만다라트로' }
  return BACK_TO[from] ?? BACK_TO['/app']
}

/**
 * 마을 화면.
 *
 * <p><b>3D 위에는 아무 UI 도 얹지 않는다.</b> 예전에는 타이틀·도메인 패널·지형 스위처가
 * 캔버스 위에 떠 있었는데, 그 좌표가 화면(vw/vh) 기준이라 셸 안으로 들어오면서 서로 겹치고
 * 잘려 화면이 뭉개졌다. 조작은 전부 캔버스 <b>아래</b> 패널에서 한다 — 3D 는 보여 주기만 한다.
 */
export default function VillagePage() {
  const { gateway, sheets: sheetList, details, setTerrain: saveTerrain } = useStore()
  const camera = useIsoCamera()
  const back = backTarget((useLocation().state as { from?: string } | null)?.from)

  const [sheet, setSheet] = useState<ModelSheet | 'none' | null>(null)
  const [village, setVillage] = useState<VillageData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  /** 지금 편집 중인 블록(0~8). 중앙(4)은 랜드마크 자리라 건물을 놓지 않는다. */
  const [block, setBlock] = useState(0)
  /** 편집 중인 칸의 task id. null 이면 아직 고르지 않은 상태. */
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const [overrides, setOverrides] = useState<Record<string, CellOverride>>({})
  const [landmark] = useState<LandmarkOverride>(AUTO_LANDMARK)

  const [terrainPending, setTerrainPending] = useState<Terrain | null>(null)
  /** 'now' = 지금 진행도, 'done' = 다 채웠을 때의 모습. */
  const [preview, setPreview] = useState<'now' | 'done'>('now')
  const [themeFilter, setThemeFilter] = useState<string>('all')

  const mandalart = useMemo(
    () => (sheet && sheet !== 'none' ? toMandalartFromModel(sheet) : null),
    [sheet],
  )

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
   */
  useEffect(() => {
    if (!sheet || sheet === 'none') return
    let alive = true

    gateway
      .villageLayout(sheet.id)
      .then((layout) => {
        if (!alive) return
        const next: Record<string, CellOverride> = {}
        for (const spot of layout.spots) {
          if (spot.subjectId != null && spot.itemKey) {
            next[String(spot.subjectId)] = {
              building: spot.itemKey,
              stage: 'auto',
            }
          }
        }
        setOverrides(next)
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

  /** 지금 고른 블록의 도메인. 중앙은 랜드마크라 건물 목록이 없다. */
  const domain = mandalart ? mandalart.domains[block] : null
  const isCenter = block === CENTER_BLOCK_INDEX
  const task = domain?.tasks.find((t) => t.id === selectedTask) ?? null

  /** 테마 필터를 거친 보유 건물. 이미지로 고르는 목록이다. */
  const pickable = useMemo(() => {
    const list = catalog.list.filter((b) => b.type !== 'LANDMARK')
    return themeFilter === 'all' ? list : list.filter((b) => b.theme === themeFilter)
  }, [catalog, themeFilter])

  /** 왼쪽 목록에 쓸 테마별 보유 개수. 랜드마크는 배치 대상이 아니라 빼고 센다. */
  const themeCounts = useMemo(() => {
    const normal = catalog.list.filter((b) => b.type !== 'LANDMARK')
    const counted = catalog.themes
      .map((t) => ({
        id: t.id,
        label: t.label,
        count: normal.filter((b) => b.theme === t.id).length,
      }))
      // 랜드마크만 있던 테마는 고를 게 없으니 목록에서 뺀다.
      .filter((t) => t.count > 0)
    return [{ id: 'all', label: '전체', count: normal.length }, ...counted]
  }, [catalog])

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
    <div className="flex flex-col gap-4">
      <ThumbnailBakery />

      <div>
        <Button variant="quiet" size="sm" to={back.to}>
          <IconArrowLeft className="size-[18px]" /> {back.label}
        </Button>
      </div>

      {/* ───────── 3D 뷰. 위에 아무것도 얹지 않는다 ───────── */}
      {/*
        3D 를 키우되 <b>바로 아래 조작 바까지가 첫 화면에 들어오게</b> 높이를 잡는다.

        빼는 210px 의 내역: 헤더 64 + 본문 위 여백 24 + 카드 사이 간격 16 + 조작 바 약 68,
        그리고 바 아래가 살짝 보이도록 남기는 여유 38. 이 여유가 없으면 바가 화면 맨
        아래 선에 딱 붙어 잘린 것처럼 보인다.

        vh 가 아니라 dvh 를 쓰는 이유는 모바일 주소창이 접혔다 펴질 때 vh 가 따라오지
        않아 바가 화면 밖으로 밀려나기 때문이다.
      */}
      <section
        className="card overflow-hidden p-0"
        style={{ height: 'clamp(360px, calc(100dvh - 210px), 1000px)' }}
      >
        <Scene
          mandalart={shown ?? mandalart}
          selected={block}
          overrides={overrides}
          themes={{}}
          terrain={village.terrain}
          catalog={catalog}
          selectedTaskId={selectedTask}
          landmark={landmark}
          cameraRef={camera.ref}
          initialZoom={camera.zoom}
          onFacingChange={camera.setFacing}
          focus={focus}
          onSelect={(i) => {
            if (i < 0) return
            setBlock(i)
            setSelectedTask(null)
          }}
          onSelectTask={setSelectedTask}
        />
      </section>

      {/* ───────── 시점 · 지형 ───────── */}
      <section className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
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

        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          <span className="muted text-[12px] font-bold">지형</span>
          <Segmented
            size="sm"
            value={village.terrain}
            onChange={(v) => void changeTerrain(v as Terrain)}
            options={TERRAINS.map((t) => ({
              value: t,
              label: TERRAIN_LABEL[t],
            }))}
          />
          {terrainPending && <span className="muted text-[11px] font-bold">저장 중…</span>}
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

      {/* ───────── 건물 배치 ───────── */}
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title m-0">건물 배치</h2>
            <p className="muted m-0 mt-1 text-[12.5px] font-semibold">
              세부 목표 → 칸 → 건물 순으로 고르면 마을에 바로 세워집니다.
            </p>
          </div>
          <Badge>{catalog.list.length}종 보유</Badge>
        </div>

        {/* 세부 목표 8개 */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {mandalart.domains.map((d, i) => {
            if (i === CENTER_BLOCK_INDEX) return null
            const active = block === i
            const color = domainColor(domainIndexOf(i))
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setBlock(i)
                  setSelectedTask(null)
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
                  active ? 'text-white' : 'text-[var(--text-muted)]',
                )}
                style={{ background: active ? color : 'var(--surface-sunken)' }}
              >
                {d.title || `세부 목표 ${domainIndexOf(i) + 1}`}
              </button>
            )
          })}
        </div>

        {isCenter ? null : (
          <>
            {/* 블록 안 8칸 */}
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(domain?.tasks ?? []).slice(0, 8).map((t) => {
                const current = overrides[t.id]?.building
                const built = current && current !== 'auto' ? catalog.byKey.get(current) : undefined
                const active = selectedTask === t.id

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTask(t.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl p-3 text-left transition-all',
                      active && 'ring-2 ring-brand-400/60',
                    )}
                    style={{ background: 'var(--surface-sunken)' }}
                  >
                    <span
                      className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl"
                      style={{ background: 'var(--surface-card)' }}
                    >
                      {built ? (
                        <BuildingImage
                          k={built.itemKey}
                          remoteUrl={built.thumbnailUrl}
                          parts={built.parts}
                          size={44}
                          alt={built.name}
                        />
                      ) : (
                        <span className="muted text-[10px] font-bold">자동</span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-bold">{t.title}</span>
                      <span className="mt-1 block">
                        <ProgressBar
                          value={t.progress}
                          size="sm"
                          color={domainColor(domainIndexOf(block))}
                          label={`${t.title} 진행률`}
                        />
                      </span>
                      <span className="muted mt-1 block truncate text-[11px] font-semibold">
                        {built ? built.name : '진행률에 맞춰 자동'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* 건물 고르기 — 왼쪽 테마 목록 / 오른쪽 건물 사진 */}
            {task ? (
              <div
                className="mt-5 overflow-hidden rounded-2xl border"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b p-4"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[13.5px] font-extrabold">{task.title}</p>
                    <p className="muted m-0 mt-0.5 text-[11.5px] font-semibold">
                      이 칸에 세울 건물을 고르세요
                    </p>
                  </div>
                  <Button variant="quiet" size="sm" onClick={() => void place(task.id, 'auto')}>
                    자동으로
                  </Button>
                </div>

                {/*
                  좌우 분할. 예전에는 테마가 <Select> 하나였는데, 13개 테마를 펼쳐 보지 않으면
                  뭐가 있는지 알 수 없었고 보유 개수도 드러나지 않았다. 왼쪽에 목록으로
                  세워 두면 어느 테마를 얼마나 모았는지가 고르는 동안 계속 보인다.

                  좁은 화면에서는 세로로 쌓는다 — 나란히 두면 양쪽 다 못 쓸 만큼 좁아진다.
                */}
                {/*
                  테마 목록은 이름 한 줄과 개수만 있으면 된다. 34%(≈140px 이상)를 주니
                  글자 옆이 비고 정작 주인공인 건물 그리드가 좁아 한 줄에 6개밖에 못 놨다.
                  132px 로 줄이면 '사이버펑크' 같은 긴 이름도 들어가면서 그리드가 넓어진다.
                */}
                <div className="grid md:grid-cols-[132px_1fr]">
                  {/* 왼쪽: 테마 + 보유 개수 */}
                  <div
                    className="no-scrollbar max-h-[300px] overflow-y-auto border-b p-1.5 md:border-r md:border-b-0"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    {themeCounts.map((t) => {
                      const active = themeFilter === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setThemeFilter(t.id)}
                          aria-pressed={active}
                          className={cn(
                            'flex w-full items-center justify-between gap-1.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                            active
                              ? 'bg-brand-500/12 text-brand-600 dark:text-brand-400'
                              : 'text-[var(--text-strong)] hover:bg-[var(--surface-sunken)]',
                          )}
                        >
                          <span className="truncate text-[12.5px] font-bold">{t.label}</span>
                          <span
                            className={cn(
                              'shrink-0 text-[11.5px] font-black tabular-nums',
                              !active && 'muted',
                            )}
                          >
                            {t.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* 오른쪽: 건물 사진 */}
                  {pickable.length === 0 ? (
                    <p className="muted m-0 p-4 text-[12.5px] font-semibold">
                      이 테마에 보유한 건물이 없어요. 상점에서 먼저 구매해 주세요.
                    </p>
                  ) : (
                    <ul className="no-scrollbar m-0 grid max-h-[300px] list-none grid-cols-3 gap-2 overflow-y-auto p-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-9">
                      {pickable.map((b) => {
                        const chosen = overrides[task.id]?.building === b.itemKey
                        return (
                          <li key={b.itemKey}>
                            <button
                              type="button"
                              onClick={() => void place(task.id, b.itemKey)}
                              title={b.name}
                              className={cn(
                                'flex w-full flex-col items-center gap-1 rounded-xl p-2 transition-all hover:-translate-y-0.5',
                                chosen && 'ring-2 ring-brand-400/70',
                              )}
                              style={{ background: 'var(--surface-sunken)' }}
                            >
                              <BuildingImage
                                k={b.itemKey}
                                remoteUrl={b.thumbnailUrl}
                                parts={b.parts}
                                size={64}
                                alt={b.name}
                              />
                              <span className="w-full truncate text-[10.5px] font-bold">
                                {b.name}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <p className="muted m-0 mt-4 text-[12px] font-medium">
                위에서 칸을 하나 고르면 건물 목록이 나옵니다.
              </p>
            )}
          </>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {sheet && (
          <Button variant="secondary" to={`/app/sheets/${sheet.id}`}>
            <IconArrowLeft className="size-[18px]" /> 만다라트로 보기
          </Button>
        )}
        <Button variant="quiet" to="/app/shop">
          상점에서 건물 사기 <IconArrowRight className="size-[18px]" />
        </Button>
      </div>
    </div>
  )
}
