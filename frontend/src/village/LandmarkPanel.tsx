import { BuildingImage } from './BuildingImage'
import { LANDMARK_STAGE_LABELS, type LandmarkStage } from './partTypes'
import type { LandmarkOverride } from './Landmark'
import type { OwnedCatalog } from './ownedCatalog'
import { landmarkStageOf, urbanLevelOf, type Domain } from './types'
import Button from '../components/common/ActionButton'
import { Badge, ProgressBar, Select, domainColor } from '../components/common/Primitives'

interface Props {
  /** 정중앙 블록. tasks 는 8개 도메인의 진행률 요약이다. */
  center: Domain
  catalog: OwnedCatalog
  override: LandmarkOverride
  /**
   * 마을이 지금 무엇을 보여주는지. 'done' 이면 3D 가 진행률을 100 으로 올려 8단계를 그리므로
   * 이 패널의 단계 표시도 따라가야 한다 — 어긋나면 마을과 숫자가 다른 말을 한다.
   */
  preview: 'now' | 'done'
  onPatch: (patch: Partial<LandmarkOverride>) => void
  onReset: () => void
}

/** 0 은 "공사 부지"라 "0단계"로 읽히면 안 된다. 나머지는 `n단계 · 라벨`. */
const ALL_STAGES: LandmarkStage[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

/**
 * 표시 단계 선택지. `LANDMARK_STAGE_LABELS` 에서 그대로 파생하므로 부르는 쪽이 만들지 않는다 —
 * 두 곳에서 만들면 라벨이 갈라진다.
 */
const STAGE_OPTIONS: { value: LandmarkStage | 'auto'; label: string }[] = [
  { value: 'auto', label: '자동 (진행률에 맞춤)' },
  ...ALL_STAGES.map((stage) => ({
    value: stage,
    label: stage === 0 ? LANDMARK_STAGE_LABELS[0] : `${stage}단계 · ${LANDMARK_STAGE_LABELS[stage]}`,
  })),
]

/**
 * 정중앙(중심 목표) 패널.
 *
 * <p>다른 블록은 칸 8개를 각각 설정하지만, 중앙은 자리가 하나뿐이라 설정할 것도 하나다.
 * 대신 "그 하나가 왜 지금 단계인지"를 보여줘야 하므로 8개 도메인 진행률을 같이 나열한다 —
 * 그 평균이 곧 랜드마크의 단계이기 때문이다(`landmarkStageOf`).
 *
 * <p>건물을 고르는 것은 이 패널이 아니라 아래 피커가 한다. 칸이 하나라 "칸을 먼저 고른다"는
 * 단계가 없어서, 피커를 열고 닫을 이유도 없다.
 */
export function LandmarkPanel({ center, catalog, override, preview, onPatch, onReset }: Props) {
  const done = preview === 'done'

  /*
    진행률 막대는 완성형에서도 **실제 값**을 보여준다 — 마을은 가정을 그리지만 이 숫자는
    데이터다. 대신 단계 표시는 3D 를 따라간다(`VillagePage.shownLandmark` 와 같은 규칙).
  */
  const overall = urbanLevelOf(center) * 100
  const autoStage = landmarkStageOf(center)
  const stage: LandmarkStage = done
    ? 8
    : override.stage !== 'auto'
      ? override.stage
      : autoStage

  const picked =
    override.building !== 'auto'
      ? catalog.landmarks.find((b) => b.itemKey === override.building)
      : catalog.landmarks[0]

  const none = catalog.landmarks.length === 0

  return (
    <div
      className="mt-5 overflow-hidden rounded-2xl border"
      style={{ borderColor: 'var(--border-hairline)' }}
    >
      {/* ── 지금 서 있는 랜드마크 ── */}
      <div
        className="flex flex-wrap items-center gap-3 border-b p-4"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <span
          className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl"
          style={{ background: 'var(--surface-sunken)' }}
        >
          {picked ? (
            <BuildingImage
              k={picked.itemKey}
              remoteUrl={picked.thumbnailUrl}
              parts={picked.parts}
              size={56}
              alt={picked.name}
              landmark
            />
          ) : (
            <span aria-hidden="true" className="text-[20px]">
              🏗
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[13.5px] font-extrabold">
            {picked?.name ?? '보유한 랜드마크 없음'}
          </p>
          <p className="muted m-0 mt-0.5 text-[11.5px] font-semibold">
            {none ? '중앙은 공사 부지로 남습니다' : '중심 목표 · 3×3 랜드마크'}
          </p>
        </div>

        {!none && (
          <Badge tone={stage >= 8 ? 'success' : 'brand'}>
            {stage}/8 · {LANDMARK_STAGE_LABELS[stage]}
          </Badge>
        )}
      </div>

      <div className="p-4">
        {/* ── 전체 진행률. 12.5% 눈금이 곧 단계 경계다 ── */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[12.5px] font-bold">전체 진행률</span>
          <span className="muted text-[11.5px] font-bold tabular-nums">
            {/* 완성형에서도 실제 값이다. 위 배지가 8단계인 것과 어긋나 보이므로 그렇다고 적는다. */}
            {Math.round(overall)}% · {done ? '실제 값 (완성형 미리보기 중)' : `자동 단계 ${autoStage}/8`}
          </span>
        </div>

        {/*
          눈금을 막대 위에 겹쳐 그린다. 단계가 12.5% 마다 오른다는 것을 숫자로만 적으면
          "왜 아직 안 올랐는지"가 안 읽히는데, 경계를 보여주면 다음 칸까지 얼마인지 보인다.
        */}
        <div className="relative mt-1.5">
          <ProgressBar value={overall} label="만다라트 전체 진행률" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute inset-y-0 w-px opacity-80"
              style={{ left: `${i * 12.5}%`, background: 'var(--surface-card)' }}
            />
          ))}
        </div>

        {/* ── 표시 단계. 저장되지 않는 미리보기다 ── */}
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[12.5px] font-bold text-[var(--text-muted)]">표시 단계</span>
          <Select
            value={done ? '8' : String(override.stage)}
            disabled={done}
            onChange={(e) =>
              onPatch({
                stage:
                  e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as LandmarkStage),
              })
            }
          >
            {STAGE_OPTIONS.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </Select>
          {/*
            완성형에서 이 컨트롤은 먹지 않는다. 비활성만 하고 이유를 적지 않으면 고장으로
            보이므로 같이 적는다. 고른 값은 남아 있어서 완성형을 끄면 돌아온다.
          */}
          {done && (
            <span className="text-[11.5px] font-medium text-[var(--text-muted)]">
              완성형 보기에서는 8단계로 고정됩니다. 끄면 고른 단계로 돌아옵니다.
            </span>
          )}
        </label>

        {/* ── 이 값들의 평균이 위의 자동 단계를 만든다 ── */}
        <p className="mt-5 mb-2 text-[12.5px] font-bold">도메인 8개 진행률</p>
        <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
          {center.tasks.slice(0, 8).map((t, i) => (
            <li key={t.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] font-semibold">
                  {i + 1}. {t.title || '(빈 도메인)'}
                </span>
                <span className="muted shrink-0 text-[11px] font-black tabular-nums">
                  {t.progress}%
                </span>
              </div>
              <span className="mt-1 block">
                <ProgressBar
                  value={t.progress}
                  size="sm"
                  color={domainColor(i)}
                  label={`${t.title} 진행률`}
                />
              </span>
            </li>
          ))}
        </ul>

        {(override.building !== 'auto' || override.stage !== 'auto') && (
          <div className="mt-4">
            <Button variant="quiet" size="sm" onClick={onReset}>
              자동으로 되돌리기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
