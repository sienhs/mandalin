import { BuildingImage } from './BuildingImage'
import { LANDMARK_STAGE_LABELS, type LandmarkStage } from './partTypes'
import type { LandmarkOverride } from './Landmark'
import type { OwnedCatalog } from './ownedCatalog'
import { landmarkStageOf, urbanLevelOf, type Domain } from './types'
import { Badge, ProgressBar, domainColor } from '../components/common/Primitives'

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
}

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
export function LandmarkPanel({ center, catalog, override, preview }: Props) {
  const done = preview === 'done'

  /*
    진행률 막대는 완성형에서도 **실제 값**을 보여준다 — 마을은 가정을 그리지만 이 숫자는
    데이터다. 대신 단계 표시는 3D 를 따라간다(`VillagePage.shownLandmark` 와 같은 규칙).
  */
  const overall = urbanLevelOf(center) * 100
  const autoStage = landmarkStageOf(center)
  const stage: LandmarkStage = done ? 8 : override.stage !== 'auto' ? override.stage : autoStage

  const picked =
    override.building !== 'auto'
      ? catalog.landmarks.find((b) => b.itemKey === override.building)
      : catalog.landmarks[0]

  const none = catalog.landmarks.length === 0

  return (
    <div
      className="mt-4 shrink-0 overflow-hidden rounded-2xl border"
      style={{ borderColor: 'var(--border-hairline)' }}
    >
      {/*
        ── 지금 서 있는 랜드마크 ──

        한 줄로 줄였다(썸네일 56 → 40, `p-4` → `p-3`, 부제 제거). 아래 피커가 고른 랜드마크에
        테두리를 두르고 이름도 붙여 주므로 여기서 크게 다시 보여줄 필요가 없다. 남기는 것은
        <b>단계 배지</b>다 — 그건 피커에 없다.
      */}
      <div
        className="flex items-center gap-2.5 border-b p-3"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <span
          className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl"
          style={{ background: 'var(--surface-sunken)' }}
        >
          {picked ? (
            <BuildingImage
              k={picked.itemKey}
              remoteUrl={picked.thumbnailUrl}
              parts={picked.parts}
              size={38}
              alt={picked.name}
              landmark
            />
          ) : (
            <span aria-hidden="true" className="text-[16px]">
              🏗
            </span>
          )}
        </span>

        <p className="m-0 min-w-0 flex-1 truncate text-[13px] font-extrabold">
          {picked?.name ?? '보유한 랜드마크 없음'}
        </p>

        {none ? (
          <span className="muted shrink-0 text-[11px] font-semibold">공사 부지로 남습니다</span>
        ) : (
          <Badge tone={stage >= 8 ? 'success' : 'brand'} className="shrink-0">
            {stage}/8 · {LANDMARK_STAGE_LABELS[stage]}
          </Badge>
        )}
      </div>

      <div className="p-3">
        {/* ── 전체 진행률. 12.5% 눈금이 곧 단계 경계다 ── */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[12.5px] font-bold">전체 진행률</span>
          <span className="muted text-[11.5px] font-bold tabular-nums">
            {/* 완성형에서도 실제 값이다. 위 배지가 8단계인 것과 어긋나 보이므로 그렇다고 적는다. */}
            {Math.round(overall)}% ·{' '}
            {done ? '실제 값 (완성형 미리보기 중)' : `자동 단계 ${autoStage}/8`}
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

        {/*
          표시 단계를 고르는 select 가 여기 있었다(약 52px). **없앴다** — 단계는 진행률이
          정하는 것이고, 손으로 고르는 것은 사실상 개발용 미리보기였다. 그 높이는 아래 랜드마크
          피커가 쓰는 편이 낫다(한 줄이 더 보인다).

          완성형 미리보기에서 8단계가 되는 것은 이 컨트롤과 무관하다 — `shown` 이 진행률을 100
          으로 올리면 `landmarkStageOf` 가 8 을 돌려준다.
        */}

        {/*
          이 값들의 평균이 위의 자동 단계를 만든다.

          <details> 로 접어 둔다 — 8줄이 항상 펼쳐져 있으면 좁은 패널에서 아래 피커가 화면
          밖으로 밀린다. 단계의 근거가 필요할 때만 펼치면 된다.
        */}
        <details className="mt-4">
          <summary className="cursor-pointer text-[12.5px] font-bold select-none">
            도메인 8개 진행률
          </summary>
          <ul className="mt-2 mb-0 grid list-none gap-2.5 p-0">
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
        </details>

        {/*
          `자동으로 되돌리기` 버튼이 여기 있었다(약 52px). **없앴다** — 바로 아래 피커 머리의
          `자동으로` 가 같은 일을 한다(칸을 비우면 보유 목록 첫 종이 선다). 표시 단계를 없앤
          뒤로는 되돌릴 것이 건물 하나뿐이라 둘이 완전히 겹쳤다.
        */}
      </div>
    </div>
  )
}
