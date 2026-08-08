import { useEffect, useMemo, useRef, useState } from 'react'
import { BuildingImage } from './BuildingImage'
import { LandmarkPanel } from './LandmarkPanel'
import type { LandmarkOverride } from './Landmark'
import { CENTER_BLOCK_INDEX } from './layout'
import type { OwnedCatalog } from './ownedCatalog'
import type { CellOverride } from './GrowableObject'
import type { Mandalart } from './types'
import Button from '../components/common/ActionButton'
import { ProgressBar, domainColor } from '../components/common/Primitives'
import { cn } from '../utils/cn'

/**
 * 건물 배치 패널 — **3D 캔버스 위에 얹히는 오버레이.**
 *
 * <p>예전에는 캔버스 <b>아래</b> 카드였다. 세로가 넉넉해서 칸 목록과 건물 목록을 한 화면에
 * 나란히 뒀는데, 520px 패널에서 그 둘을 나누면 정작 주인공인 건물 그리드가 10칸 남짓밖에 안
 * 보였다. 그래서 <b>2단계로 갈랐다</b>.
 *
 * <pre>
 *   1단계  도메인 칩 + 8칸 목록(2열)      ← 어느 칸을 고칠지
 *   2단계  ← 과제명 · 테마 칩 · 건물 그리드  ← 무엇을 세울지. 패널을 온전히 쓴다(4열 76px)
 * </pre>
 *
 * <p>대가는 클릭 한 번과, 칸을 바꿔가며 나란히 비교할 수 없다는 것이다. 좁은 폭에서 둘 다
 * 잘려 보이는 것보다 낫다고 판단했다.
 *
 * <p>폭 때문에 바꾼 것이 둘 더 있다.
 * <ul>
 *   <li>테마 목록이 왼쪽 세로 칸(132px) → <b>가로 칩 줄</b>. 세로 칸을 떼면 그리드가 380px 밖에
 *       안 남아 한 줄에 넷도 못 놓는다. 칩으로 두면 어느 테마를 얼마나 모았는지(보유 개수
 *       배지)는 그대로 보인다 — 그게 세로 칸을 쓴 원래 이유였다.</li>
 *   <li>랜드마크 패널의 도메인 8개 진행률은 접었다({@link LandmarkPanel}).</li>
 * </ul>
 *
 * <p>랜드마크(중심 목표)는 자리가 하나뿐이라 2단계가 없다 — 상태와 피커를 한 화면에 둔다.
 *
 * <p>패널이 마을을 가리는 것은 카메라가 해결한다. 부모가 이 패널의 폭을
 * `Scene`(→`IsoCamera`)의 `occludedLeft` 로 넘기면 마을이 남은 영역 중앙으로 미끄러진다.
 */

/** 패널 폭. 부모가 카메라 이동량을 계산할 때도 쓰므로 여기서 내보낸다. */
export const BUILD_PANEL_WIDTH = 520

/** 블록 인덱스(0~8, 4=중앙) → 도메인 번호(0~7). 색을 고를 때 쓴다. */
function domainIndexOf(blockIndex: number): number {
  return blockIndex < CENTER_BLOCK_INDEX ? blockIndex : blockIndex - 1
}

interface Props {
  mandalart: Mandalart
  catalog: OwnedCatalog
  /** 지금 고른 블록(0~8). 4 면 랜드마크 모드. */
  block: number
  onBlockChange: (block: number) => void
  selectedTask: string | null
  onSelectTask: (taskId: string | null) => void
  overrides: Record<string, CellOverride>
  onPlace: (taskId: string, itemKey: string | 'auto') => void
  themeFilter: string
  onThemeFilter: (id: string) => void
  landmark: LandmarkOverride
  onPlaceLandmark: (itemKey: string | 'auto') => void
  /** 마을이 지금 무엇을 보여주는지. 랜드마크 단계 표시가 3D 와 어긋나지 않게 한다. */
  preview: 'now' | 'done'
  onClose: () => void
}

export function BuildPanel({
  mandalart,
  catalog,
  block,
  onBlockChange,
  selectedTask,
  onSelectTask,
  overrides,
  onPlace,
  themeFilter,
  onThemeFilter,
  landmark,
  onPlaceLandmark,
  preview,
  onClose,
}: Props) {
  const isCenter = block === CENTER_BLOCK_INDEX
  const domain = mandalart.domains[block]
  const task = domain?.tasks.find((t) => t.id === selectedTask) ?? null

  /**
   * 2단계 — 건물 고르는 화면인지.
   *
   * <p>칸 목록과 건물 목록을 **동시에 보여주지 않는다.** 아래 카드였을 때는 세로가 넉넉해서
   * 나란히 뒀지만, 520px 패널에서 둘을 나누면 정작 주인공인 건물 그리드가 10칸 남짓밖에
   * 안 보였다. 한 번에 하나만 보여주면 그 화면이 패널을 온전히 쓴다.
   *
   * <p>대가는 클릭 한 번(← 로 칸 목록 복귀)과, 칸을 바꿔가며 나란히 비교할 수 없다는 것이다.
   */
  const picking = !isCenter && task !== null

  /** 테마 필터를 거친 보유 건물. 랜드마크는 배치 대상이 아니라 빠진다. */
  const pickable = useMemo(() => {
    const list = catalog.list.filter((b) => b.type !== 'LANDMARK')
    return themeFilter === 'all' ? list : list.filter((b) => b.theme === themeFilter)
  }, [catalog, themeFilter])

  /** 테마별 보유 개수. 고를 게 없는 테마는 목록에서 뺀다. */
  const themeCounts = useMemo(() => {
    const normal = catalog.list.filter((b) => b.type !== 'LANDMARK')
    const counted = catalog.themes
      .map((t) => ({
        id: t.id,
        label: t.label,
        count: normal.filter((b) => b.theme === t.id).length,
      }))
      .filter((t) => t.count > 0)
    return [{ id: 'all', label: '전체', count: normal.length }, ...counted]
  }, [catalog])

  const pickBlock = (i: number) => {
    onBlockChange(i)
    onSelectTask(null)
  }

  /* ── 테마 줄 접기 (2단계) ─────────────────────────────────────────────── */

  /** 건물 그리드가 스크롤하는 상자. 테마 줄이 이 안에서 sticky 로 붙는다. */
  const gridScrollRef = useRef<HTMLDivElement>(null)
  /** 스크롤을 내려서 테마 줄이 얇게 접혔는지. */
  const [themeCollapsed, setThemeCollapsed] = useState(false)

  /**
   * 스크롤 위치로 접기를 판단한다 — **경계를 두 개 둔다(hysteresis).**
   *
   * <p>펼친 줄(약 110px)이 접히면 40px 이 되면서 아래 내용이 70px 쯤 올라온다. 경계가 하나면
   * 그 이동이 다시 경계를 넘어 접힘↔펼침이 진동한다. 접히는 문턱(120)을 펴지는 문턱(30)보다
   * 훨씬 높게 두면 그 이동폭이 사이에 들어가 한 번에 안정된다.
   */
  const handleGridScroll = () => {
    const y = gridScrollRef.current?.scrollTop ?? 0
    setThemeCollapsed((was) => (was ? y > 30 : y > 120))
  }

  /**
   * 칸이나 테마가 바뀌면 맨 위로 돌리고 펼친다.
   *
   * <p>그리드 내용이 통째로 갈렸는데 스크롤이 중간에 남아 있으면 "빈 화면"처럼 보인다. 그리고
   * 접힌 상태에서는 고른 테마 하나만 보이므로, 테마를 바꾼 직후에는 전체 목록을 다시 보여주는
   * 편이 맞다.
   */
  useEffect(() => {
    gridScrollRef.current?.scrollTo({ top: 0 })
    setThemeCollapsed(false)
  }, [selectedTask, themeFilter])

  /** 접힌 줄에 보여줄, 지금 고른 테마. */
  const activeTheme = themeCounts.find((t) => t.id === themeFilter) ?? themeCounts[0]

  return (
    <div
      /*
        캔버스 컨테이너 기준(absolute inset)으로 붙인다. **vw/vh 를 쓰지 않는다** — 예전에
        3D 위 UI 를 걷어낸 이유가 화면 기준 좌표라 셸 안에서 겹치고 잘렸던 것이다.
        컨테이너 기준이면 셸 크기와 무관해 그 실패가 재발하지 않는다.
      */
      /*
        마을 안내(`tours.ts` 의 `village`)가 이 패널을 통째로 가리킨다. 안쪽의 도메인 칩 ·
        8칸 목록 · 건물 그리드를 따로 짚지 않는 이유는 셋이 <b>한 흐름의 세 단계</b>라서다 —
        갈래를 고르고, 칸을 고르고, 건물을 고르는 순서를 세 번에 나눠 말하면 오히려 끊긴다.
      */
      data-tour="village-panel"
      className="card absolute top-4 bottom-4 left-4 flex flex-col overflow-hidden p-0 shadow-lg"
      style={{ width: BUILD_PANEL_WIDTH }}
    >
      {/*
        머리글 줄이 없다 — "건물 배치" 라는 제목과 안내 문구가 약 70px 을 먹었는데, 패널이 무엇을
        하는 곳인지는 안에 있는 것(도메인 칩·칸 목록·건물 그리드)이 이미 말해 준다. 그 높이를
        건물 그리드에 준다.

        **닫기 버튼만 남긴다.** 이게 없으면 패널을 접을 수 없고 마을이 계속 옆으로 밀린 채
        남는다. 줄을 만들지 않고 우상단에 떠 있게 두면 자리를 차지하지 않는다 — 이 패널이
        `absolute` 라 그 자체가 자식의 기준이 된다.
      */}
      <button
        type="button"
        onClick={onClose}
        aria-label="건물 배치 패널 닫기"
        title="닫기 — 마을이 중앙으로 돌아옵니다"
        className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full border text-[15px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
        style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
      >
        ✕
      </button>

      {/*
        본문.

        `flex flex-col` 이라야 안쪽 피커가 `flex-1` 로 남은 높이를 가져갈 수 있다. 고정 부분
        (도메인 칩·8칸 목록)은 `shrink-0` 으로 눌리지 않게 하고, 늘어나는 것은 건물 그리드
        하나뿐이다. `overflow-y-auto` 는 창이 아주 낮아 고정 부분만으로 넘칠 때의 대비다.

        첫 줄에 `pr-10` 을 주는 이유는 떠 있는 닫기 버튼과 겹치지 않게 하려는 것이다.

        위 패딩(`pt-4`)은 여기가 아니라 **첫 자식**이 갖는다. 스크롤 컨테이너에 위 패딩이
        있으면 `sticky top-0` 이 그 패딩 <b>아래</b>에 붙어서, 머리 위 16px 틈으로 지나가는
        내용이 보인다. 패딩을 자식으로 내리면 sticky 가 스크롤 영역 맨 위에 딱 붙는다.
      */}
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
        {/*
          중심 목표 + 세부 목표 8개.

          중심을 먼저 두고 칸막이로 끊는다 — 세부 목표와 같은 줄에 섞으면 "9번째 세부 목표"로
          읽히는데, 실제로는 자리 수도(8칸 vs 1칸) 단계 규칙도(3단계 vs 8단계) 다른 종류다.

          가로 스크롤이 아니라 wrap 이다. 스크롤로 두면 지금 어느 도메인에 있는지 찾기가
          번거롭다 — 3~4행을 쓰더라도 9개가 한눈에 보이는 쪽이 낫다.

          **2단계에서는 감춘다.** 특정 칸에 세울 건물을 고르는 중에 도메인을 바꾸는 것은
          그 흐름을 버리는 일이라, 그 자리를 건물 그리드에 주는 편이 낫다. ← 로 돌아오면 있다.
        */}
        <div
          className={cn(
            'flex shrink-0 flex-wrap items-center gap-1.5 pt-4 pr-10',
            picking && 'hidden',
          )}
        >
          <button
            type="button"
            onClick={() => pickBlock(CENTER_BLOCK_INDEX)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
              isCenter
                ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
                : 'text-[var(--text-muted)]',
            )}
            style={isCenter ? undefined : { background: 'var(--surface-sunken)' }}
          >
            <span aria-hidden="true">🗺</span>
            중심 목표
          </button>

          <span
            aria-hidden="true"
            className="mx-1 h-4 w-px"
            style={{ background: 'var(--border-hairline)' }}
          />

          {mandalart.domains.map((d, i) => {
            if (i === CENTER_BLOCK_INDEX) return null
            const active = block === i
            const color = domainColor(domainIndexOf(i))
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => pickBlock(i)}
                className={cn(
                  'max-w-[150px] truncate rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
                  active ? 'text-white' : 'text-[var(--text-muted)]',
                )}
                style={{ background: active ? color : 'var(--surface-sunken)' }}
              >
                {d.title || `세부 목표 ${domainIndexOf(i) + 1}`}
              </button>
            )
          })}
        </div>

        {isCenter ? (
          <>
            <LandmarkPanel
              center={mandalart.domains[CENTER_BLOCK_INDEX]}
              catalog={catalog}
              override={landmark}
              preview={preview}
            />

            {/*
              랜드마크 고르기. 테마가 하나뿐이라 테마 칩 줄이 없다.

              **스크롤이 하나다.** 예전에는 이 컨테이너가 `flex-1 overflow-hidden` 이고 안쪽
              그리드가 다시 `overflow-y-auto` 라, 본문과 그리드가 각각 스크롤했다(이중 스크롤).
              휠을 굴렸을 때 어느 쪽이 움직일지 예측이 안 되고, 위 상태 카드를 보려면 안쪽에서
              한 번 빠져나와야 했다.

              지금은 이 컨테이너가 높이를 요구하지 않고 내용만큼 늘어난다. 스크롤은 패널 본문
              하나뿐이고, 대신 아래 머리를 `sticky` 로 붙여 무엇을 고르는 중인지와 `자동으로` 가
              스크롤해도 남는다.

              `overflow-hidden` 을 뺀 것이 핵심이다 — 그게 있으면 sticky 의 기준이 이 상자가
              되어, 상자째로 스크롤되면서 머리가 같이 사라진다.
            */}
            <div
              className="mt-4 rounded-2xl border"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div
                /*
                  스크롤 영역(패널 본문) 맨 위에 붙는다. 배경을 채워야 아래로 지나가는 썸네일이
                  글자 뒤로 겹쳐 보이지 않는다. 위쪽 모서리는 컨테이너의 둥근 모서리를 따라간다.
                */
                className="sticky top-0 z-[5] flex items-center justify-between gap-2 rounded-t-2xl border-b p-3"
                style={{
                  borderColor: 'var(--border-hairline)',
                  background: 'var(--surface-card)',
                }}
              >
                {/* 부제("단계는 진행률이 정합니다")를 뺐다 — 위 진행률 카드가 이미 말한다. */}
                <p className="m-0 min-w-0 truncate text-[13px] font-extrabold">세울 랜드마크</p>
                <Button
                  variant="quiet"
                  size="xs"
                  onClick={() => onPlaceLandmark('auto')}
                  disabled={landmark.building === 'auto'}
                >
                  자동으로
                </Button>
              </div>

              {catalog.landmarks.length === 0 ? (
                /*
                  상점을 권하지 않는다 — 랜드마크는 포인트로 사는 물건이 아니라 완성 보상이고,
                  서버가 구매 자체를 거부한다(BUILDING_NOT_PURCHASABLE).
                */
                <p className="muted m-0 p-3 text-[12px] font-semibold">
                  아직 보유한 랜드마크가 없어요. 랜드마크는 상점에서 살 수 없고, 만다라트를 채워
                  해금합니다. 그동안 중앙은 공사 부지로 남습니다.
                </p>
              ) : (
                /* 내부 스크롤 없음 — 13종이 그대로 늘어서고 패널 본문이 한 번만 스크롤한다. */
                <ul className="m-0 grid list-none grid-cols-3 gap-2 p-3">
                  {catalog.landmarks.map((b) => {
                    const chosen = landmark.building === b.itemKey
                    return (
                      <li key={b.itemKey}>
                        <button
                          type="button"
                          onClick={() => onPlaceLandmark(b.itemKey)}
                          title={b.name}
                          className={cn(
                            'flex w-full flex-col items-center gap-1 rounded-xl p-2 transition-all hover:-translate-y-0.5',
                            chosen && 'ring-2 ring-brand-400/70',
                          )}
                          style={{ background: 'var(--surface-sunken)' }}
                        >
                          {/* landmark 플래그가 있어야 8단계 렌더러로 굽는다(일반 건물은 3단계다). */}
                          <BuildingImage
                            k={b.itemKey}
                            remoteUrl={b.thumbnailUrl}
                            parts={b.parts}
                            size={72}
                            alt={b.name}
                            landmark
                          />
                          <span className="w-full truncate text-[10.5px] font-bold">{b.name}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        ) : !picking ? (
          <>
            {/* ── 1단계: 칸 고르기 ── */}
            {/*
              블록 안 8칸을 **1열, 남은 높이를 8등분**해서 둔다.

              폭: 2열이었을 때는 칸당 230px 남짓이라 과제명이 대부분 잘렸다. 1열이면 456px 라
              온전히 보인다.

              높이: **고정 높이로 두면 안 된다.** 8줄 × 76px 은 1080p 에서만 맞고 그보다 낮은
              창에서는 스크롤이 생겼다 — 칸을 고르는 화면에서 스크롤은 "여기 아래에 더 있다"를
              모르면 못 찾는다는 뜻이라, 8개가 <b>항상 한눈에</b> 보여야 한다. 그래서 행을
              `1fr` 로 두고 남은 높이를 나눈다. 창이 커지면 여유 있게, 작아지면 촘촘하게
              배치되고 스크롤이 안 생긴다.

              `minmax(48px, 1fr)` 의 48px 는 내용(썸네일 40 + 여백)이 깨지지 않는 하한이다.
              그보다 낮은 창에서는 잘리는 대신 본문이 스크롤한다 — 캔버스 최소 높이(360px)
              근처의 극단이라 실제로는 거의 닿지 않는다.
            */}
            <div
              className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-2"
              style={{ gridTemplateRows: 'repeat(8, minmax(48px, 1fr))' }}
            >
              {(domain?.tasks ?? []).slice(0, 8).map((t) => {
                const current = overrides[t.id]?.building
                const built = current && current !== 'auto' ? catalog.byKey.get(current) : undefined

                return (
                  /*
                    타일 전체가 버튼이 아니라 **오른쪽 버튼만** 버튼이다.

                    <button> 안에 <button> 은 유효하지 않은 HTML 이라, 이동 버튼을 넣으려면 겉을
                    div 로 내려야 한다. 겉을 클릭 가능하게 두는 편이 손은 편하지만, 그러려면
                    role·tabIndex·키보드 처리를 손으로 붙여야 하고 안쪽 버튼과 이벤트가 겹친다.
                    이동 지점이 하나로 분명한 편이 낫다.

                    8:2 비율은 grid 로 못 박는다(`8fr 2fr`) — flex 로 두면 과제명 길이에 따라
                    버튼 폭이 흔들린다.
                  */
                  <div
                    key={t.id}
                    /* 지금 서 있는 건물 이름은 여기로 옮겼다 — 아래 주석 참고. */
                    title={built ? `현재: ${built.name}` : '진행률에 맞춰 자동'}
                    className="grid min-h-0 items-center gap-2 overflow-hidden rounded-2xl px-3"
                    style={{
                      background: 'var(--surface-sunken)',
                      gridTemplateColumns: '8fr 2fr',
                    }}
                  >
                    {/* ── 8: 과제 + 진행률 ── */}
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl"
                        style={{ background: 'var(--surface-card)' }}
                      >
                        {built ? (
                          <BuildingImage
                            k={built.itemKey}
                            remoteUrl={built.thumbnailUrl}
                            parts={built.parts}
                            size={38}
                            alt={built.name}
                          />
                        ) : (
                          <span className="muted text-[9.5px] font-bold">자동</span>
                        )}
                      </span>

                      {/*
                        두 줄만 쓴다(과제명 + 진행률 바). 예전에는 아래에 "시계탑" 같은 현재 건물
                        이름을 한 줄 더 뒀는데, 행 높이가 48px 까지 줄어들 수 있으니 세 줄은
                        들어가지 않는다. **왼쪽 썸네일이 이미 그 건물이라** 이름은 중복에 가깝고,
                        정확히 알아야 할 때는 tooltip(title)에 있다.
                      */}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold">{t.title}</span>
                        <span className="mt-1.5 block">
                          <ProgressBar
                            value={t.progress}
                            size="sm"
                            color={domainColor(domainIndexOf(block))}
                            label={`${t.title} 진행률`}
                          />
                        </span>
                      </span>

                      <span className="muted shrink-0 text-[12px] font-black tabular-nums">
                        {t.progress}%
                      </span>
                    </div>

                    {/* ── 2: 건물 변경하기 ── */}
                    <button
                      type="button"
                      onClick={() => onSelectTask(t.id)}
                      title={`${t.title} — 세울 건물 고르기`}
                      /*
                        두 줄로 감싸이게 둔다(`whitespace-normal`). 폭이 20% 라 한 줄로는 넘치고,
                        디자인 시스템의 Button 은 `whitespace-nowrap` 이라 여기서는 쓸 수 없다.

                        배경을 `surface-card` 로 채운다. 테두리만 있으면 타일 배경
                        (`surface-sunken`)과 명도가 붙어 버튼으로 안 읽혔다 — 한 단 밝게 띄워야
                        "누르는 것"으로 보인다.
                      */
                      className="grid h-9 place-items-center rounded-xl border px-1 text-[10.5px] font-bold leading-tight whitespace-normal text-[var(--text-strong)] shadow-sm transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-600"
                      style={{
                        borderColor: 'var(--border-hairline)',
                        background: 'var(--surface-card)',
                      }}
                    >
                      건물 변경하기
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            {/* ── 2단계: 건물 고르기 — 패널을 온전히 쓴다 ── */}
            {/*
              과제명을 여기 적는다. 1단계에서는 8칸 목록의 테두리가 "어느 칸인지"를 말해 줬지만
              2단계에서는 그 목록이 안 보이므로, 이름이 없으면 무엇을 고치는 중인지 알 수 없다.
              ← 복귀 버튼과 한 줄로 합쳐 높이를 아낀다.
            */}
            <div className="mb-3 flex shrink-0 items-center gap-2 pt-4 pr-10">
              <button
                type="button"
                onClick={() => onSelectTask(null)}
                aria-label="칸 목록으로 돌아가기"
                className="grid size-8 shrink-0 place-items-center rounded-full border text-[15px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                ←
              </button>
              <p className="m-0 min-w-0 flex-1 truncate text-[13px] font-extrabold">
                {task?.title}
              </p>
              <Button variant="quiet" size="xs" onClick={() => task && onPlace(task.id, 'auto')}>
                자동으로
              </Button>
            </div>

            <div
              /*
                  최소 높이는 **여기**에 있어야 한다(테마 줄 76 + 그리드 160 + 테두리).
                  `min-h-0` 을 주면 `flex-1` 이 0 으로 붕괴하고, `overflow-hidden` 때문에 안쪽
                  그리드가 통째로 잘려 **건물 목록이 사라진다.** 최소 높이를 지키면 대신 본문이
                  스크롤한다.
                */
              className="flex min-h-[248px] flex-1 flex-col overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {/*
                스크롤하는 상자를 여기 하나 둔다. 테마 줄이 이 안에서 `sticky` 로 붙어야 하므로
                테마 줄과 그리드가 **같은 스크롤 컨테이너** 안에 있어야 한다 — 예전처럼 테마 줄을
                밖에 두고 그리드만 스크롤시키면 줄이 늘 그 두께로 남는다.
              */}
              <div
                ref={gridScrollRef}
                onScroll={handleGridScroll}
                className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
              >
                {/*
                  테마 줄 — **스크롤을 내리면 얇게 접힌다.**

                  펼친 상태는 14개(전액 + 13종)가 세 줄로 전부 보인다. 그게 세로 칸(132px)을
                  칩으로 바꾼 이유였다 — 어느 테마를 얼마나 모았는지가 고르는 동안 보여야 한다.
                  다만 110px 은 건물을 훑어 내릴 때는 너무 두껍다.

                  그래서 스크롤을 내리면 <b>고른 테마 하나만</b> 남는 40px 줄로 접는다. 무엇으로
                  걸러 보는 중인지는 계속 보이고, 전체 목록은 맨 위로 돌아가면 다시 나온다.
                */}
                <div
                  className={cn(
                    'sticky top-0 z-[5] flex flex-wrap items-center gap-1.5 border-b',
                    themeCollapsed ? 'p-1.5' : 'p-2.5',
                  )}
                  style={{
                    borderColor: 'var(--border-hairline)',
                    background: 'var(--surface-card)',
                  }}
                >
                  {themeCollapsed ? (
                    <>
                      <span className="flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-[11.5px] font-bold text-brand-600 dark:text-brand-400">
                        <span className="truncate">{activeTheme?.label}</span>
                        <span className="shrink-0 text-[10.5px] font-black tabular-nums opacity-70">
                          {activeTheme?.count}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => gridScrollRef.current?.scrollTo({ top: 0 })}
                        className="muted ml-auto shrink-0 rounded-full px-2 py-1 text-[11px] font-bold transition-colors hover:text-[var(--text-strong)]"
                      >
                        전체 테마 ▴
                      </button>
                    </>
                  ) : (
                    themeCounts.map((t) => {
                      const active = themeFilter === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onThemeFilter(t.id)}
                          aria-pressed={active}
                          className={cn(
                            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold transition-colors',
                            active
                              ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
                          )}
                          style={active ? undefined : { background: 'var(--surface-sunken)' }}
                        >
                          <span className="truncate">{t.label}</span>
                          <span className="shrink-0 text-[10.5px] font-black tabular-nums opacity-70">
                            {t.count}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>

                {pickable.length === 0 ? (
                  <p className="muted m-0 p-3 text-[12px] font-semibold">
                    이 테마에 보유한 건물이 없어요. 상점에서 먼저 구매해 주세요.
                  </p>
                ) : (
                  /*
                    스크롤은 위 상자가 한다 — 여기서 또 스크롤하지 않는다(이중 스크롤 금지).
                    4열 76px 은 2단계로 나눠 폭·높이를 온전히 쓰게 되면서 키운 값이다. 건물을
                    알아보는 것이 이 화면의 일이므로 개수보다 크기가 중요하다.
                  */
                  <ul className="m-0 grid list-none grid-cols-4 gap-2 p-3">
                    {pickable.map((b) => {
                      const chosen = overrides[task.id]?.building === b.itemKey
                      return (
                        <li key={b.itemKey}>
                          <button
                            type="button"
                            onClick={() => onPlace(task.id, b.itemKey)}
                            title={b.name}
                            className={cn(
                              'flex w-full flex-col items-center gap-1 rounded-xl p-1.5 transition-all hover:-translate-y-0.5',
                              chosen && 'ring-2 ring-brand-400/70',
                            )}
                            style={{ background: 'var(--surface-sunken)' }}
                          >
                            <BuildingImage
                              k={b.itemKey}
                              remoteUrl={b.thumbnailUrl}
                              parts={b.parts}
                              size={76}
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
          </>
        )}
      </div>
    </div>
  )
}
