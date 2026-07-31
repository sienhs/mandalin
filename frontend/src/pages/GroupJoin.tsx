import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import SheetGrid from '../components/sheet/SheetGrid'
import SheetMiniGrid from '../components/sheet/SheetMiniGrid'
import { buildGrid } from '../components/sheet/sheet.utils'
import { loadSheetDetail } from '../components/sheetDetail/sheetDetail.data'
import { MY_SHEETS } from '../components/sheetList/sheetList.data'
import { cn } from '../utils/cn'
// 카드(.card) · 9x9 칸(.Sheet) · 3x3 확대 그리드(.mgrid) 는 생성 화면과 공유한다.
import '../styles/sheet-create.css'
import '../styles/group-join.css'

/** 그룹에 기여할 도메인 수. 서버도 정확히 2개를 요구한다(GroupDomainMappingRequest). */
const PICK_COUNT = 2

/** 9x9 의 가운데 블록. 핵심 목표와 도메인 라벨이 모인 칸이라 도메인으로 고를 수 없다. */
const CENTER_BLOCK = 4

/**
 * 그룹 만다라트 합류 화면. 초대를 수락하면 들어온다.
 *
 * 내 만다라트 하나를 고르고, 그 안의 도메인 2개를 그룹에 내놓는다.
 * 3x3 블록 하나가 도메인 하나라서 블록을 눌러 고른다.
 */
export default function GroupJoin() {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const { state } = useLocation()
  const groupTitle = (state as { groupTitle?: string } | null)?.groupTitle ?? '그룹'

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

  const changeSheet = (nextSheetId: number) => {
    setSheetId(nextSheetId)
    // 시트가 바뀌면 도메인도 다른 것이므로 선택을 비운다.
    setPicked([])
  }

  /**
   * 그룹에 도메인을 등록한다.
   *
   * 연동 시: PATCH /api/v1/groups/{groupId}/domains 로 { sheetId, domainIds } 를 보낸다.
   * domainIds 는 도메인의 실제 아이디인데, 지금 화면이 쓰는 Domain 타입에는 아이디가 없다
   * (상세 응답의 DomainDetail.domainId 가 그 값이다). 그래서 목업에서는 위치만 들고 있다.
   */
  const save = () => {
    if (!groupId || picked.length !== PICK_COUNT) return
    navigate('/sheets')
  }

  return (
    // min-w: 생성 · 상세 화면과 같이 폭을 고정한다(반응형 아님).
    <div className="min-h-screen min-w-[1280px] bg-[#F6F7F8]">
      <Header />

      <main className="mx-auto w-[1280px] px-6 pb-[70px] pt-6">
        <section className="group-join-banner">
          <h1 className="group-join-banner-title">{groupTitle} 그룹에 합류중</h1>
          <p className="group-join-banner-desc">내 구역을 채우면 그룹 만다라트에 적용돼요</p>
        </section>

        <div className="group-join-actions">
          <Button variant="ghost" onClick={() => navigate('/sheets')}>
            취소
          </Button>
          <Button variant="primary" onClick={save} disabled={picked.length !== PICK_COUNT}>
            저장({picked.length}/{PICK_COUNT} 완료)
          </Button>
        </div>

        <div className="card grid grid-cols-[1fr_360px] items-start gap-x-6 gap-y-2 p-5">
          {/* 좌측 상단: 어떤 만다라트에서 도메인을 낼지 고른다 */}
          <div className="col-start-1 row-start-1 flex items-center justify-between gap-3 pb-1">
            <h2 className="section-title m-0 text-sm">2D 뷰 (도메인)</h2>
            <div className="group-join-picker">
              <label htmlFor="group-join-sheet" className="text-[12px] font-bold text-ink-500">
                내 만다라트
              </label>
              <select
                id="group-join-sheet"
                value={sheetId}
                onChange={(event) => changeSheet(Number(event.target.value))}
                className="group-join-select"
              >
                {MY_SHEETS.map((sheet) => (
                  <option key={sheet.sheetId} value={sheet.sheetId}>
                    {sheet.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 우측 상단: 저장 경고 */}
          <p className="col-start-2 row-start-1 m-0 whitespace-nowrap pb-1 text-[11.5px] font-bold text-[#dc3424]">
            한 번 저장하면 수정할 수 없어요!
          </p>

          {/* 칸을 누르면 그 칸이 속한 블록(=도메인)이 골라진다 */}
          <SheetGrid
            grid={grid}
            selectedCell={null}
            onSelect={({ b }) => toggleBlock(b)}
            heading={null}
            className="col-start-1 row-start-2"
            blockClassName={(b) =>
              cn(
                picked.includes(b) && 'group-join-block--picked',
                b === CENTER_BLOCK && 'group-join-block--locked',
              )
            }
          />

          <div className="col-start-2 row-start-2 flex flex-col gap-4">
            <SheetMiniGrid blockIndex={shownBlock} cells={grid[shownBlock]} />

            <section className="group-join-picked" aria-labelledby="picked-domains">
              <p id="picked-domains" className="group-join-picked-label">
                고른 도메인 ({picked.length}/{PICK_COUNT})
              </p>
              {picked.length > 0 ? (
                <ul className="group-join-picked-list">
                  {pickedTitles.map((title, i) => (
                    <li key={picked[i]} className="group-join-picked-item">
                      {title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="group-join-picked-hint">
                  그리드에서 3x3 구역을 눌러 도메인 2개를 고르세요.
                </p>
              )}
              {picked.length === PICK_COUNT && (
                <p className="group-join-picked-hint">
                  다 골랐어요. 위 저장을 누르면 그룹에 적용됩니다.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
