import { useMemo, useState } from 'react'
import { Scene } from '../village/Scene'
import { MOCK_MANDALART } from '../village/mockData'
import { urbanLevelOf } from '../village/types'
import {
  BUILDING_LIST,
  THEMES,
  type BuildingKey,
  type Stage,
  type ThemeKey,
} from '../village/catalog'
import { AUTO_CELL, type CellOverride } from '../village/GrowableObject'

const STAGE_OPTS: { value: Stage | 'auto'; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 1, label: '1·일관화' },
  { value: 2, label: '2·형태' },
  { value: 3, label: '3·완성' },
]

export default function VillagePage() {
  const [selected, setSelected] = useState<number | null>(null)
  const [overrides, setOverrides] = useState<Record<string, CellOverride>>({})
  const [themes, setThemes] = useState<Record<string, ThemeKey>>({})
  const mandalart = MOCK_MANDALART
  const domain = selected != null ? mandalart.domains[selected] : null

  const groups = useMemo(() => {
    const g: Record<string, [BuildingKey, string][]> = { village: [], city: [] }
    BUILDING_LIST.forEach((b) => g[b.group].push([b.key, b.label]))
    return g
  }, [])

  const patchCell = (taskId: string, patch: Partial<CellOverride>) =>
    setOverrides((prev) => ({ ...prev, [taskId]: { ...(prev[taskId] ?? AUTO_CELL), ...patch } }))

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

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: 'system-ui, sans-serif' }}>
      <Scene
        mandalart={mandalart}
        selected={selected}
        overrides={overrides}
        themes={themes}
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
          <div
            style={{
              background: '#f2f6f8',
              borderRadius: 10,
              padding: 12,
              marginBottom: 14,
            }}
          >
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
            <div style={{ display: 'flex', gap: 6 }}>
              {STAGE_OPTS.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => setAllStages(o.value)}
                  style={{
                    flex: 1,
                    padding: '6px 2px',
                    borderRadius: 8,
                    border: '1px solid #d0d7dc',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
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
                  {/* 건물 선택 */}
                  <select
                    value={cur.building}
                    onChange={(e) => patchCell(t.id, { building: e.target.value as CellOverride['building'] })}
                    style={{
                      flex: 2,
                      padding: '6px 8px',
                      borderRadius: 8,
                      border: '1px solid #d0d7dc',
                      fontSize: 13,
                      background: cur.building === 'auto' ? '#f6f8f9' : '#eef7ff',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="auto">자동 (기본 배치)</option>
                    {Object.entries(groups).map(([groupName, items]) => (
                      <optgroup key={groupName} label={groupName === 'village' ? '🏡 마을풍' : '🏙 도시풍'}>
                        {items.map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  {/* 단계 선택 */}
                  <select
                    value={String(cur.stage)}
                    onChange={(e) =>
                      patchCell(t.id, {
                        stage: e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as Stage),
                      })
                    }
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: 8,
                      border: '1px solid #d0d7dc',
                      fontSize: 13,
                      background: cur.stage === 'auto' ? '#f6f8f9' : '#eef7ff',
                      cursor: 'pointer',
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
              width: '100%',
              marginTop: 4,
              padding: '8px',
              borderRadius: 8,
              border: '1px solid #d0d7dc',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            이 도메인 전부 자동으로 되돌리기
          </button>
        </div>
      )}
    </div>
  )
}
