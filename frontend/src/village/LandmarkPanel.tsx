import { BuildingImage } from './BuildingImage'
import { LANDMARK_STAGE_LABELS, type LandmarkStage } from './partTypes'
import type { LandmarkOverride } from './Landmark'
import type { OwnedCatalog } from './ownedCatalog'
import { landmarkStageOf, urbanLevelOf, type Domain } from './types'

interface Props {
  /** 정중앙 블록. tasks 는 8개 도메인의 진행률 요약이다. */
  center: Domain
  catalog: OwnedCatalog
  override: LandmarkOverride
  stageOpts: { value: LandmarkStage | 'auto'; label: string }[]
  onPatch: (patch: Partial<LandmarkOverride>) => void
  onOpenPicker: () => void
  onReset: () => void
}

/**
 * 정중앙(중심 목표) 패널.
 *
 * 다른 블록은 칸 8개를 각각 설정하지만, 중앙은 자리가 하나뿐이라 설정할 것도 하나다.
 * 대신 "그 하나가 왜 지금 단계인지"를 보여줘야 하므로 8개 도메인 진행률을 같이 나열한다.
 */
export function LandmarkPanel({
  center, catalog, override, stageOpts, onPatch, onOpenPicker, onReset,
}: Props) {
  const overall = urbanLevelOf(center) * 100
  const autoStage = landmarkStageOf(center)
  const stage: LandmarkStage = override.stage !== 'auto' ? override.stage : autoStage

  const picked = override.building !== 'auto'
    ? catalog.landmarks.find((b) => b.itemKey === override.building)
    : catalog.landmarks[0]

  const label = picked?.name ?? (catalog.landmarks.length === 0 ? '보유한 랜드마크 없음' : '자동')

  return (
    <div>
      <div style={{ background: '#f2f6f8', borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          중심 목표 · 3×3 랜드마크
        </div>

        {/* 선택된 랜드마크 — 썸네일 + 이름 */}
        <button
          onClick={onOpenPicker}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            padding: 8, borderRadius: 10, border: '1px solid #d0d7dc',
            background: override.building === 'auto' ? '#fff' : '#eef7ff', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ width: 56, height: 56, flex: '0 0 56px', borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(180deg,#eaf4f8,#f6f9fb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {picked
              ? <BuildingImage k={picked.itemKey} remoteUrl={picked.thumbnailUrl} parts={picked.parts} size={56} alt={picked.name} landmark />
              : <span style={{ fontSize: 20 }}>🏗</span>}
          </span>
          <span style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label}
            </div>
            <div style={{ fontSize: 11, color: '#5a6b76' }}>
              {stage}/8 단계 · {LANDMARK_STAGE_LABELS[stage]}
            </div>
          </span>
          <span style={{ marginLeft: 'auto', color: '#8a97a0' }}>▾</span>
        </button>

        {/* 전체 진행률 = 8개 도메인 평균. 단계 경계를 눈금으로 같이 보여준다. */}
        <div style={{ fontSize: 12, color: '#5a6b76', marginBottom: 4 }}>
          전체 진행률 {Math.round(overall)}% · 자동 단계 {autoStage}/8
        </div>
        <div style={{ position: 'relative', height: 8, background: '#e6ebee', borderRadius: 5, marginBottom: 10 }}>
          <div
            style={{
              width: `${Math.min(100, overall)}%`, height: '100%', borderRadius: 5,
              background: overall >= 87.5 ? '#2f9e44' : overall > 0 ? '#f08c00' : '#adb5bd',
            }}
          />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span
              key={i}
              style={{
                position: 'absolute', top: -1, bottom: -1, left: `${i * 12.5}%`,
                width: 1, background: 'rgba(255,255,255,0.85)',
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>표시 단계</div>
        <select
          value={String(override.stage)}
          onChange={(e) =>
            onPatch({ stage: e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as LandmarkStage) })
          }
          style={{
            width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d7dc', fontSize: 13,
            background: override.stage === 'auto' ? '#fff' : '#eef7ff', cursor: 'pointer',
          }}
        >
          {stageOpts.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 8개 도메인 진행률 — 이 값들의 평균이 위의 단계를 만든다 */}
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>도메인 8개 진행률</div>
      {center.tasks.slice(0, 8).map((t, i) => (
        <div key={t.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3, gap: 8 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {i + 1}. {t.title || '(빈 도메인)'}
            </span>
            <span style={{ color: '#5a6b76', flex: '0 0 auto' }}>{t.progress}%</span>
          </div>
          <div style={{ height: 5, background: '#e6ebee', borderRadius: 4 }}>
            <div
              style={{
                width: `${t.progress}%`, height: '100%', borderRadius: 4,
                background: t.progress >= 100 ? '#2f9e44' : t.progress > 0 ? '#f08c00' : '#adb5bd',
              }}
            />
          </div>
        </div>
      ))}

      <button
        onClick={onReset}
        style={{
          width: '100%', marginTop: 8, padding: 8, borderRadius: 8,
          border: '1px solid #d0d7dc', background: '#fff', cursor: 'pointer', fontSize: 13,
        }}
      >
        랜드마크 설정 자동으로 되돌리기
      </button>
    </div>
  )
}
