import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Scene } from '../village/Scene'
import { fetchMySheets, fetchSheetDetail, type SheetDetail } from '../components/sheet/sheet.api'
import { toMandalart } from '../village/mandalart'
import { urbanLevelOf } from '../village/types'
import { THEMES, type Stage, type ThemeKey } from '../village/partTypes'
import { AUTO_CELL, type CellOverride } from '../village/GrowableObject'
import { BuildingPicker } from '../village/BuildingPicker'
import { TerrainSwitcher } from '../village/TerrainSwitcher'
import { ThumbnailBakery } from '../village/thumbnailBaker'
import { buildOwnedCatalog } from '../village/ownedCatalog'
import { changeTerrain, fetchMyVillage, type Terrain, type VillageData } from '../village/villageApi'

const STAGE_OPTS: { value: Stage | 'auto'; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 1, label: '1·일관화' },
  { value: 2, label: '2·형태' },
  { value: 3, label: '3·완성' },
]

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', color: '#5a6b76' }}>
      <TopBar />
      <div style={{ textAlign: 'center' }}>{children}</div>
    </div>
  )
}

export default function VillagePage() {
  const initialDomain = (() => {
    const q = new URLSearchParams(window.location.search).get('domain')
    const n = q == null ? NaN : Number(q)
    return Number.isInteger(n) && n >= 0 ? n : null
  })()

  const [selected, setSelected] = useState<number | null>(initialDomain)
  const [overrides, setOverrides] = useState<Record<string, CellOverride>>({})
  const [themes, setThemes] = useState<Record<string, ThemeKey>>({})
  const [pickerTask, setPickerTask] = useState<string | null>(null)
  /** 3D 에서 고른 건물 자리. 우측 목록의 스포트라이트와 같은 값을 본다. */
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  const [village, setVillage] = useState<VillageData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [terrainPreview, setTerrainPreview] = useState<Terrain | null>(null)
  const [terrainPending, setTerrainPending] = useState<Terrain | null>(null)
  const [terrainError, setTerrainError] = useState<string | null>(null)

  /** null = 아직 조회 중, 'none' = 만다라트가 하나도 없음. */
  const [sheet, setSheet] = useState<SheetDetail | 'none' | null>(null)

  const mandalart = useMemo(
    () => (sheet && sheet !== 'none' ? toMandalart(sheet) : null),
    [sheet],
  )
  const domain = selected != null && mandalart ? mandalart.domains[selected] : null

  useEffect(() => {
    let alive = true
    fetchMyVillage()
      .then((data) => alive && setVillage(data))
      .catch((e: unknown) => alive && setLoadError(e instanceof Error ? e.message : '마을을 불러오지 못했습니다.'))
    return () => {
      alive = false
    }
  }, [])

  // 마을에 세울 건물은 만다라트에서 나온다. 목록에서 가장 최근 시트를 골라 상세를 받는다 —
  // 목록 응답에는 도메인·과제가 없어서 상세 조회가 한 번 더 필요하다.
  useEffect(() => {
    let alive = true
    fetchMySheets()
      .then((sheets) => {
        if (!alive) return
        if (sheets.length === 0) {
          setSheet('none')
          return
        }
        return fetchSheetDetail(sheets[0].sheetId).then((detail) => {
          if (alive) setSheet(detail)
        })
      })
      .catch((e: unknown) => {
        if (alive) setLoadError(e instanceof Error ? e.message : '만다라트를 불러오지 못했습니다.')
      })
    return () => {
      alive = false
    }
  }, [])

  // 3D 에서 고른 자리가 목록 밖으로 밀려 있으면 보이는 곳까지 끌어온다.
  useEffect(() => {
    spotlightRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedTask])

  const catalog = useMemo(() => buildOwnedCatalog(village?.buildings ?? []), [village])
  const labelOf = useMemo(
    () => Object.fromEntries(catalog.list.map((b) => [b.itemKey, b.name])) as Record<string, string>,
    [catalog],
  )

  const patchCell = (taskId: string, patch: Partial<CellOverride>) =>
    setOverrides((prev) => ({ ...prev, [taskId]: { ...(prev[taskId] ?? AUTO_CELL), ...patch } }))

  /** 도메인 8칸을 특정 테마 건물들로 채운다(단계 3). */
  const fillWithTheme = (themeId: string) => {
    if (!domain) return
    const group = catalog.themes.find((t) => t.id === themeId)
    if (!group || group.items.length === 0) return
    setOverrides((prev) => {
      const next = { ...prev }
      domain.tasks.slice(0, 8).forEach((t, i) => {
        next[t.id] = { building: group.items[i % group.items.length].itemKey, stage: 3 }
      })
      return next
    })
  }

  /** 도메인 8칸 전체에 같은 단계 적용 (일관화). */
  const setAllStages = (stage: Stage | 'auto') => {
    if (!domain) return
    setOverrides((prev) => {
      const next = { ...prev }
      domain.tasks.forEach((t) => {
        next[t.id] = { ...(next[t.id] ?? AUTO_CELL), stage }
      })
      return next
    })
  }

  const resetDomain = () => {
    if (!domain) return
    setOverrides((prev) => {
      const next = { ...prev }
      domain.tasks.forEach((t) => delete next[t.id])
      return next
    })
  }

  /**
   * 지형 변경은 낙관적으로 먼저 반영한다. 3D 전체가 갈아끼워지는 조작이라
   * 왕복을 기다리면 버튼이 먹힌 것처럼 보인다. 실패하면 이전 지형으로 되돌린다.
   */
  const handleTerrainPick = async (terrain: Terrain) => {
    if (!village || village.terrain === terrain) return
    const previous = village.terrain

    setTerrainError(null)
    setTerrainPending(terrain)
    setTerrainPreview(null)
    setVillage({ ...village, terrain })

    try {
      await changeTerrain(terrain)
    } catch (e) {
      setVillage((prev) => (prev ? { ...prev, terrain: previous } : prev))
      setTerrainError(e instanceof Error ? e.message : '지형을 저장하지 못했습니다.')
    } finally {
      setTerrainPending(null)
    }
  }

  const domainTheme: ThemeKey = domain ? themes[domain.id] ?? 'warm' : 'warm'

  if (loadError) {
    return (
      <Centered>
        <div style={{ fontSize: 16, marginBottom: 6 }}>마을을 불러오지 못했습니다.</div>
        <div style={{ fontSize: 13 }}>{loadError}</div>
      </Centered>
    )
  }

  if (!village || sheet === null) {
    return <Centered>마을을 불러오는 중…</Centered>
  }

  // 만다라트가 없으면 세울 건물도 없다. 예전에는 이 자리에 mock 만다라트를 그렸는데,
  // 사용자가 자기 목표라고 착각하고 그 위에서 건물을 배치하려 했다.
  if (sheet === 'none' || !mandalart) {
    return (
      <Centered>
        <div style={{ fontSize: 16, marginBottom: 8 }}>아직 만다라트가 없습니다.</div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>
          핵심 목표와 과제를 정하면 그대로 마을이 만들어집니다.
        </div>
        <Link
          to="/sheet/create"
          style={{
            display: 'inline-block', padding: '10px 18px', borderRadius: 10,
            background: '#97cca1', color: '#fff', fontWeight: 700, textDecoration: 'none',
          }}
        >
          만다라트 만들기
        </Link>
      </Centered>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: 'system-ui, sans-serif' }}>
      <TopBar />
      <ThumbnailBakery />
      <Scene
        mandalart={mandalart}
        selected={selected}
        overrides={overrides}
        themes={themes}
        terrain={terrainPreview ?? village.terrain}
        catalog={catalog}
        selectedTaskId={selectedTask}
        onSelect={(i) => {
          if (i < 0) {
            setSelected(null)
            setSelectedTask(null)
            return
          }
          setSelected(i)
        }}
        onSelectTask={setSelectedTask}
      />

      {/*
        좌상단 타이틀. 우측 패널(360px)과 겹치지 않도록 폭을 제한하고, 좁은 화면에서
        글자가 접히지 않게 한 줄로 고정한 뒤 넘치면 말줄임으로 자른다.
      */}
      <div
        style={{
          position: 'absolute', top: 16, left: 20, color: '#1e2a33', pointerEvents: 'none',
          maxWidth: 'min(46vw, calc(100vw - 420px))',
        }}
      >
        <div
          style={{
            fontSize: 22, fontWeight: 700,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {mandalart.center}
        </div>
        <div
          style={{
            fontSize: 13, opacity: 0.7,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          건물 자리 클릭 → 설정 · 드래그 회전 / 휠 줌
        </div>
      </div>

      {domain && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 360,
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.96)',
            borderRadius: 14,
            padding: 18,
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {domain.title}
            </h2>
            <button
              onClick={() => {
                setSelected(null)
                setSelectedTask(null)
              }}
              style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#5a6b76', marginBottom: 12 }}>
            도시화 {Math.round(urbanLevelOf(domain) * 100)}% · {urbanLevelOf(domain) >= 0.5 ? '도시풍' : '마을풍'}
          </div>

          {/* 일관화 컨트롤 */}
          <div style={{ background: '#f2f6f8', borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>1단계 테마 (일관화 색)</div>
            <select
              value={domainTheme}
              onChange={(e) => setThemes((p) => ({ ...p, [domain.id]: e.target.value as ThemeKey }))}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d7dc', fontSize: 13, marginBottom: 10 }}
            >
              {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
                <option key={k} value={k}>
                  {THEMES[k].label}
                </option>
              ))}
            </select>

            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>8칸 전체 단계 통일</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {STAGE_OPTS.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => setAllStages(o.value)}
                  style={{
                    flex: 1, padding: '6px 2px', borderRadius: 8, border: '1px solid #d0d7dc',
                    background: '#fff', cursor: 'pointer', fontSize: 12,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>보유 테마로 8칸 채우기</div>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) fillWithTheme(e.target.value)
                e.target.value = ''
              }}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d7dc', fontSize: 13 }}
            >
              <option value="" disabled>테마 선택…</option>
              {catalog.themes.map((t) => (
                <option key={t.id} value={t.id}>{t.label} ({t.items.length})</option>
              ))}
            </select>
          </div>

          {/* 칸별 건물 + 단계 */}
          {domain.tasks.map((t) => {
            const cur = overrides[t.id] ?? AUTO_CELL
            const spotlit = selectedTask === t.id
            return (
              <div
                key={t.id}
                ref={spotlit ? spotlightRef : undefined}
                onMouseEnter={() => setSelectedTask(t.id)}
                style={{
                  marginBottom: 10,
                  // 3D 에서 고른 자리가 목록 어디인지 바로 보이게 한다.
                  // 3D 하이라이트와 같은 청록 계열로 맞춰 둘이 한 쌍임을 알린다.
                  padding: '8px 10px',
                  marginLeft: -10,
                  marginRight: -10,
                  borderRadius: 10,
                  background: spotlit ? 'rgba(127,216,255,0.16)' : 'transparent',
                  boxShadow: spotlit ? 'inset 0 0 0 1.5px rgba(70,190,235,0.55)' : 'none',
                  transition: 'background 140ms ease, box-shadow 140ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, gap: 8 }}>
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </span>
                  <span style={{ color: '#5a6b76', flex: '0 0 auto' }}>{t.progress}%</span>
                </div>

                <div style={{ height: 5, background: '#e6ebee', borderRadius: 4, marginBottom: 6 }}>
                  <div
                    style={{
                      width: `${t.progress}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: t.progress >= 100 ? '#2f9e44' : t.progress > 0 ? '#f08c00' : '#adb5bd',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {/* 건물 선택 — 썸네일 그리드 모달 열기 */}
                  <button
                    onClick={() => setPickerTask(t.id)}
                    style={{
                      flex: 2, padding: '6px 10px', borderRadius: 8, border: '1px solid #d0d7dc', fontSize: 13,
                      background: cur.building === 'auto' ? '#f6f8f9' : '#eef7ff',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cur.building === 'auto' ? '자동 (기본 배치)' : labelOf[cur.building] ?? cur.building}
                    </span>
                    <span style={{ color: '#8a97a0' }}>▾</span>
                  </button>

                  {/* 단계 선택 */}
                  <select
                    value={String(cur.stage)}
                    onChange={(e) =>
                      patchCell(t.id, {
                        stage: e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as Stage),
                      })
                    }
                    style={{
                      flex: 1, padding: '6px 4px', borderRadius: 8, border: '1px solid #d0d7dc', fontSize: 13,
                      background: cur.stage === 'auto' ? '#f6f8f9' : '#eef7ff', cursor: 'pointer',
                    }}
                  >
                    {STAGE_OPTS.map((o) => (
                      <option key={String(o.value)} value={String(o.value)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}

          <button
            onClick={resetDomain}
            style={{
              width: '100%', marginTop: 4, padding: '8px', borderRadius: 8,
              border: '1px solid #d0d7dc', background: '#fff', cursor: 'pointer', fontSize: 13,
            }}
          >
            이 도메인 전부 자동으로 되돌리기
          </button>
        </div>
      )}

      <TerrainSwitcher
        current={village.terrain}
        onPreview={setTerrainPreview}
        onPick={handleTerrainPick}
        pending={terrainPending}
        error={terrainError}
      />

      {/* 건물 썸네일 그리드 선택 모달 */}
      {pickerTask && (
        <BuildingPicker
          catalog={catalog}
          value={(overrides[pickerTask] ?? AUTO_CELL).building}
          onPick={(v) => patchCell(pickerTask, { building: v })}
          onClose={() => setPickerTask(null)}
        />
      )}
    </div>
  )
}
