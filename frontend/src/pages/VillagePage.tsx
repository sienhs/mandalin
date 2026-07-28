import { useEffect, useMemo, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Scene } from '../village/Scene'
import { MOCK_MANDALART } from '../village/mockData'
import { urbanLevelOf } from '../village/types'
import { THEMES, type Stage, type ThemeKey } from '../village/partTypes'
import { AUTO_CELL, type CellOverride } from '../village/GrowableObject'
import { BuildingPicker } from '../village/BuildingPicker'
import { ThumbnailBakery } from '../village/thumbnailBaker'
import { buildOwnedCatalog } from '../village/ownedCatalog'
import { fetchMyVillage, type VillageData } from '../village/villageApi'

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

  const [village, setVillage] = useState<VillageData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const mandalart = MOCK_MANDALART
  const domain = selected != null ? mandalart.domains[selected] : null

  useEffect(() => {
    let alive = true
    fetchMyVillage()
      .then((data) => alive && setVillage(data))
      .catch((e: unknown) => alive && setLoadError(e instanceof Error ? e.message : '마을을 불러오지 못했습니다.'))
    return () => {
      alive = false
    }
  }, [])

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

  const domainTheme: ThemeKey = domain ? themes[domain.id] ?? 'warm' : 'warm'

  if (loadError) {
    return (
      <Centered>
        <div style={{ fontSize: 16, marginBottom: 6 }}>마을을 불러오지 못했습니다.</div>
        <div style={{ fontSize: 13 }}>{loadError}</div>
      </Centered>
    )
  }

  if (!village) {
    return <Centered>마을을 불러오는 중…</Centered>
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
        catalog={catalog}
        onSelect={(i) => setSelected(i < 0 ? null : i)}
      />

      <div style={{ position: 'absolute', top: 16, left: 20, color: '#1e2a33', pointerEvents: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🏡 {mandalart.center}</div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>
          블록 클릭 → 상세 · 드래그 회전 / 휠 줌 · 칸마다 건물+단계 선택, 테마로 일관화
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{domain.title}</h2>
            <button
              onClick={() => setSelected(null)}
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
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🎨 1단계 테마 (일관화 색)</div>
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

            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>📐 8칸 전체 단계 통일</div>
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

            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>💎 보유 테마로 8칸 채우기</div>
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
            return (
              <div key={t.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{t.title}</span>
                  <span style={{ color: '#5a6b76' }}>{t.progress}%</span>
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
