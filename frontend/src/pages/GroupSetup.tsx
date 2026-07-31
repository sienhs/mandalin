import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import SheetGrid from '../components/sheet/SheetGrid'
import SheetMiniGrid from '../components/sheet/SheetMiniGrid'
import { buildGrid } from '../components/sheet/sheet.utils'
import GroupLandmarkDialog from '../components/group/GroupLandmarkDialog'
import { MOCK_LANDMARKS } from '../components/group/group.data'
import { loadSheetDetail } from '../components/sheetDetail/sheetDetail.data'
import { MY_SHEETS } from '../components/sheetList/sheetList.data'
import { cn } from '../utils/cn'
// 카드(.card) · 9x9 칸(.Sheet) · 3x3 확대 그리드(.mgrid) 는 생성 화면과 공유한다.
import '../styles/sheet-create.css'
import '../styles/group-setup.css'

/** 그룹에 기여할 도메인 수. 서버도 정확히 2개를 요구한다(GroupCreateRequest · GroupDomainMappingRequest). */
const PICK_COUNT = 2

/** 9x9 의 가운데 블록. 핵심 목표와 도메인 라벨이 모인 칸이라 도메인으로 고를 수 없다. */
const CENTER_BLOCK = 4

type GroupSetupProps = {
  /**
   * create = 내가 그룹을 만든다(그룹 이름을 정한다).
   * join   = 초대를 수락해 남이 만든 그룹에 들어간다(이름은 이미 정해져 있다).
   *
   * 두 경우 모두 하는 일은 같다 — 내 만다라트에서 도메인 2개를 골라 그룹에 내놓는다.
   */
  mode: 'create' | 'join'
}

/**
 * 그룹 만다라트에 내 도메인을 넣는 화면.
 *
 * 내 만다라트 하나를 고르고, 그 안의 도메인 2개를 그룹에 내놓는다.
 * 3x3 블록 하나가 도메인 하나라서 블록을 눌러 고른다.
 */
export default function GroupSetup({ mode }: GroupSetupProps) {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const { state } = useLocation()
  /** 합류할 그룹 이름. 초대 팝업에서 넘어온다. */
  const invitedTitle = (state as { groupTitle?: string } | null)?.groupTitle ?? '그룹'

  /** 도메인을 고르는 2D 뷰와 건물을 보는 3D 뷰를 오간다. */
  const [view, setView] = useState<'2d' | '3d'>('2d')
  /** 그룹 도시 가운데에 놓을 랜드마크. 생성 요청의 centerBuildingId 로 보낼 값이다. */
  const [landmarkId, setLandmarkId] = useState(MOCK_LANDMARKS[0].buildingId)
  const [landmarkOpen, setLandmarkOpen] = useState(false)
  /** 만들 그룹 이름. create 모드에서만 쓴다. */
  const [title, setTitle] = useState('')
  /** 어떤 내 만다라트에서 도메인을 낼지 */
  const [sheetId, setSheetId] = useState(MY_SHEETS[0]?.sheetId ?? 1)
  /** 고른 블록 번호(0~8, 4 제외). 고른 순서를 유지한다. */
  const [picked, setPicked] = useState<number[]>([])

  const detail = useMemo(() => loadSheetDetail(sheetId), [sheetId])
  const grid = useMemo(
    () => buildGrid(detail.sheet.title, detail.domains, detail.subjects),
    [detail],
  )

  /** 3x3 확대 그리드에 보여줄 블록. 마지막으로 고른 것, 없으면 첫 블록. */
  const shownBlock = picked.at(-1) ?? 0

  /**
   * 블록 하나를 고르거나 뺀다.
   * 이미 2개를 골랐으면 더 받지 않는다 — 서버가 정확히 2개만 받으므로,
   * 자동으로 먼저 고른 것을 밀어내면 무엇이 빠졌는지 알기 어렵다.
   */
  const toggleBlock = (blockIndex: number) => {
    if (blockIndex === CENTER_BLOCK) return
    setPicked((prev) => {
      if (prev.includes(blockIndex)) return prev.filter((b) => b !== blockIndex)
      if (prev.length >= PICK_COUNT) return prev
      return [...prev, blockIndex]
    })
  }

  /** 고른 블록의 도메인 이름. 블록 가운데 칸(c=4)이 도메인 라벨이다. */
  const pickedTitles = picked.map((b) => grid[b][4].task)

  const landmark =
    MOCK_LANDMARKS.find((item) => item.buildingId === landmarkId) ?? MOCK_LANDMARKS[0]

  const changeSheet = (nextSheetId: number) => {
    setSheetId(nextSheetId)
    // 시트가 바뀌면 도메인도 다른 것이므로 선택을 비운다.
    setPicked([])
  }

  /** 도메인 2개는 필수, 그룹 이름은 만들 때만 필수다. */
  const canSubmit =
    picked.length === PICK_COUNT &&
    (mode === 'create' ? title.trim().length > 0 : Boolean(groupId))

  /**
   * 그룹을 만들거나, 초대받은 그룹에 도메인을 등록한다.
   *
   * 연동 시:
   *   create → POST  /api/v1/groups              { title, centerBuildingId, sheetId, domainIds }
   *   join   → PATCH /api/v1/groups/{id}/domains { sheetId, domainIds }
   *
   * centerBuildingId(중앙 랜드마크)는 이 화면에서 고르지 않는다 — 3D 뷰에서 다룰 값이다.
   * domainIds 는 도메인의 실제 아이디인데, 지금 화면이 쓰는 Domain 타입에는 아이디가 없다
   * (상세 응답의 DomainDetail.domainId 가 그 값이다). 그래서 목업에서는 위치만 들고 있다.
   */
  const submit = () => {
    if (!canSubmit) return
    // 만든(또는 합류한) 그룹 화면으로 간다. 목업이라 새 그룹 아이디가 없어 1번으로 보낸다 —
    // 연동하면 create 는 응답으로 받은 groupId 를 쓴다.
    navigate(`/group/${groupId ?? 1}`, {
      state: {
        groupTitle: mode === 'create' ? title.trim() : invitedTitle,
        sheetId,
        // 방금 만든 그룹은 팀장 혼자인 상태로 보여준다(목업이 아이디로 구분할 수 없다).
        justCreated: mode === 'create',
      },
    })
  }

  return (
    <div className="group-setup-page">
      <Header />

      <main className="group-setup-main">
        <section className="group-setup-banner">
          <div className="group-setup-banner-main">
            {mode === 'create' ? (
              <>
                <label htmlFor="group-title" className="group-setup-banner-title">
                  그룹 이름
                </label>
                <input
                  id="group-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 알고리즘 마스터"
                  className="group-setup-name"
                />
                <p className="group-setup-banner-desc">
                  내 도메인 2개를 내놓으면 그룹 만다라트가 시작돼요
                </p>
              </>
            ) : (
              <>
                <h1 className="group-setup-banner-title">{invitedTitle} 그룹에 합류중</h1>
                <p className="group-setup-banner-desc">내 구역을 채우면 그룹 만다라트에 적용돼요</p>
              </>
            )}
          </div>

          <div className="group-setup-actions">
            <Button variant="ghost" onClick={() => navigate('/sheets')}>
              취소
            </Button>
            <Button variant="primary" onClick={submit} disabled={!canSubmit}>
              {mode === 'create' ? '생성' : '저장'}({picked.length}/{PICK_COUNT} 완료)
            </Button>
          </div>
        </section>

        <div className="card group-setup-card">
          {/* 좌측 상단: 어떤 만다라트에서 도메인을 낼지 고른다 */}
          <div className="group-setup-toolbar">
            <h2 className="section-title group-setup-view-title">
              {view === '2d' ? '2D 뷰 (도메인)' : '3D 뷰 (건물)'}
            </h2>
            <div className="group-setup-picker">
              <label htmlFor="group-setup-sheet" className="group-setup-picker-label">
                내 만다라트
              </label>
              <select
                id="group-setup-sheet"
                value={sheetId}
                onChange={(event) => changeSheet(Number(event.target.value))}
                className="group-setup-select"
              >
                {MY_SHEETS.map((sheet) => (
                  <option key={sheet.sheetId} value={sheet.sheetId}>
                    {sheet.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 우측 상단: 저장 경고 · 2D/3D 전환 */}
          <div className="group-setup-topright">
            <p className="group-setup-warning">한 번 저장하면 수정할 수 없어요!</p>
            {/*
              탭 성격의 전환이라 공용 Button 을 쓰지 않는다 — 두 칸이 붙은 세그먼트 모양이고,
              누른 쪽이 계속 눌린 상태로 남는다(aria-pressed 로 알린다).
            */}
            <div className="group-setup-viewtabs" role="group" aria-label="보기 전환">
              <button
                type="button"
                onClick={() => setView('2d')}
                aria-pressed={view === '2d'}
                className="group-setup-viewtab"
              >
                2D 뷰
              </button>
              <button
                type="button"
                onClick={() => setView('3d')}
                aria-pressed={view === '3d'}
                className="group-setup-viewtab"
              >
                3D 뷰
              </button>
            </div>
          </div>

          {view === '2d' ? (
            <>
              {/* 칸을 누르면 그 칸이 속한 블록(=도메인)이 골라진다 */}
              <SheetGrid
                grid={grid}
                selectedCell={null}
                onSelect={({ b }) => toggleBlock(b)}
                heading={null}
                className="group-setup-grid"
                blockClassName={(b) =>
                  cn(
                    picked.includes(b) && 'group-setup-block--picked',
                    b === CENTER_BLOCK && 'group-setup-block--locked',
                  )
                }
              />

              <div className="group-setup-side">
                <SheetMiniGrid blockIndex={shownBlock} cells={grid[shownBlock]} />

                <section className="group-setup-picked" aria-labelledby="picked-domains">
                  <p id="picked-domains" className="group-setup-picked-label">
                    고른 도메인 ({picked.length}/{PICK_COUNT})
                  </p>
                  {picked.length > 0 ? (
                    <ul className="group-setup-picked-list">
                      {pickedTitles.map((pickedTitle, i) => (
                        <li key={picked[i]} className="group-setup-picked-item">
                          {pickedTitle}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="group-setup-picked-hint">
                      그리드에서 3x3 구역을 눌러 도메인 2개를 고르세요.
                    </p>
                  )}
                  {picked.length === PICK_COUNT && (
                    <p className="group-setup-picked-hint">
                      {mode === 'create'
                        ? '다 골랐어요. 위 생성을 누르면 그룹이 만들어집니다.'
                        : '다 골랐어요. 위 저장을 누르면 그룹에 적용됩니다.'}
                    </p>
                  )}
                </section>
              </div>
            </>
          ) : (
            <>
              {/*
                건물 시트. 2D 뷰와 같은 grid 를 보되 과제 글자 대신 건물을 세운다.
                칸에 건물이 서는 기준은 '과제가 있는지' 이고, 고른 도메인은 2D 뷰와 같은 색으로
                강조된다 — 두 뷰가 같은 picked 상태를 보므로 어느 쪽에서 골라도 함께 바뀐다.
              */}
              <ul className="group-setup-grid group-setup-buildings" aria-label="도메인별 건물">
                {grid.map((block, b) => (
                  <li
                    key={b}
                    className={cn(
                      'group-setup-bblock',
                      picked.includes(b) && 'group-setup-bblock--picked',
                    )}
                  >
                    {b === CENTER_BLOCK ? (
                      /*
                        가운데 블록은 9칸을 나누지 않고 한 칸으로 합친다 —
                        마을에서도 랜드마크는 3x3 을 차지하는 거대 건물이다(village/layout.ts).
                      */
                      <span
                        role="img"
                        aria-label={`${landmark.name} 랜드마크 자리`}
                        className="group-setup-blandmark"
                      >
                        {/*
                          랜드마크 이미지 자리. 준비되면 이모지를
                          <img className="group-setup-blandmark-img" src={...} alt="" /> 로 바꾼다
                          (표시 161 × 161px, 파일은 2배).
                        */}
                        {landmark.icon}
                      </span>
                    ) : (
                      /*
                        블록 하나가 버튼이다 — 칸마다 버튼을 두면 빈 칸이 이름 없는 버튼이 되고,
                        스크린리더에 81개가 쏟아진다. 칸은 span 으로 둔다(button 안에 li 를 넣을 수 없다).
                      */
                      <button
                        type="button"
                        onClick={() => toggleBlock(b)}
                        aria-pressed={picked.includes(b)}
                        aria-label={`${block[CENTER_BLOCK].task} 도메인`}
                        className="group-setup-bblock-pick"
                      >
                        <span className="group-setup-btiles">
                          {block.map((cell, c) => (
                            /*
                              건물 이미지 자리. 준비되면 이 안에
                              <img className="group-setup-btile-img" src={...} alt="" /> 를 넣는다
                              (표시 51 × 51px, 파일은 2배). 지금은 색으로만 구분한다.
                            */
                            <span
                              key={c}
                              aria-hidden="true"
                              className={cn(
                                'group-setup-btile',
                                cell.subject && 'group-setup-btile--built',
                              )}
                            />
                          ))}
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="group-setup-side">
                {/* 그룹 도시 미리보기 이미지가 들어갈 자리. 아직 비워 둔다. */}
                <div className="group-setup-preview">
                  <p className="group-setup-placeholder-note">도시 이미지가 들어갈 자리예요</p>
                </div>

                <section className="group-setup-landmark" aria-labelledby="landmark-title">
                  <h3 id="landmark-title" className="group-setup-landmark-title">
                    랜드마크 선택
                  </h3>
                  <p className="group-setup-landmark-desc">
                    그룹 도시 가장 가운데에 놓일 랜드마크 건물이에요.
                    <br />
                    방장만 설정할 수 있어요
                  </p>

                  <div className="group-setup-landmark-row">
                    <span className="group-setup-landmark-icon" aria-hidden="true">
                      {landmark.icon}
                    </span>
                    <span className="group-setup-landmark-name">{landmark.name}</span>
                    {/* 방장(그룹을 만드는 사람)만 바꿀 수 있다 — 합류하는 쪽에는 버튼이 없다. */}
                    {mode === 'create' && (
                      <Button
                        variant="primary"
                        size="xs"
                        className="group-setup-landmark-change"
                        onClick={() => setLandmarkOpen(true)}
                      >
                        변경
                      </Button>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      {landmarkOpen && (
        <GroupLandmarkDialog
          landmarks={MOCK_LANDMARKS}
          currentId={landmarkId}
          onApply={(buildingId) => {
            setLandmarkId(buildingId)
            setLandmarkOpen(false)
          }}
          onClose={() => setLandmarkOpen(false)}
        />
      )}
    </div>
  )
}
