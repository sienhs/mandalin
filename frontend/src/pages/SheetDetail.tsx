import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/common/Header'
import SheetGrid from '../components/sheet/SheetGrid'
import SheetMiniGrid from '../components/sheet/SheetMiniGrid'
import SelectedTaskPanel from '../components/sheetDetail/SelectedTaskPanel'
import SheetDetailHeader from '../components/sheetDetail/SheetDetailHeader'
import { useSheetDetail } from '../components/sheetDetail/useSheetDetail'
// 카드(.card) · 9x9 칸(.Sheet) · 3x3 확대 그리드(.mgrid) · 배지(.pill) 는 생성 화면과 공유한다.
import '../styles/sheet-create.css'
import '../styles/sheet-detail.css'

type SheetDetailProps = {
  /**
   * 남의 만다라트를 보는 중(친구 목록에서 들어온 경우). 수행 완료를 감춘다.
   * 시트 데이터로 소유자를 판별하지 않고 라우트로 구분한다 — 세션 복원 중에는
   * 로그인 사용자 아이디가 아직 없어서, 내 시트를 남의 것으로 오판하는 창이 생긴다.
   */
  readOnly?: boolean
}

/**
 * 만다라트 상세 화면. 목록 화면의 카드를 눌러 들어온다.
 *
 * 생성 화면과 같은 2D 뷰 + 3x3 확대 그리드를 쓰지만, 칸을 편집하는 대신
 * 선택한 과제를 수행 완료 처리하고 그만큼 달성률이 올라간다.
 */
export default function SheetDetail({ readOnly = false }: SheetDetailProps) {
  const navigate = useNavigate()
  // 주소에 숫자가 아닌 값이 들어오면 첫 번째 시트를 보여준다.
  const { sheetId } = useParams()
  const detail = useSheetDetail(Number(sheetId) || 1)

  // min-w: 가로 스크롤이 생겼을 때 오른쪽에 배경 없는 흰 띠가 보이지 않게 한다.
  return (
    <div className="min-h-screen min-w-[1280px] bg-[#F6F7F8]">
      {/* 과제를 수행하면 포인트가 늘어난다. 서버가 준 잔액을 머리말에 바로 반영한다. */}
      <Header fallbackPoint={detail.userPoint ?? undefined} />

      {/*
        폭을 고정한다(반응형 아님) — max-w 로 두면 브라우저를 확대할 때 CSS 뷰포트가 좁아지면서
        컨테이너가 같이 줄고, 9x9 칸이 눌려 글자와 칸 비율이 깨진다.
        좁은 창에서는 화면이 줄어드는 대신 가로 스크롤이 생긴다.
      */}
      <main className="mx-auto w-[1280px] px-6 pb-[70px] pt-6">
        <div className="card p-6">
          {/*
            불러오는 중에도 아래 그리드는 그대로 그린다(빈 칸으로) — 화면을 통째로 감췄다가
            띄우면 레이아웃이 튄다. 실패했을 때만 이유를 알려준다.
          */}
          {detail.error && (
            <p className="m-0 mb-3 text-[12.5px] font-bold text-[#dc3424]" role="alert">
              {detail.error}
            </p>
          )}

          <SheetDetailHeader
            sheet={detail.sheet}
            achievementRate={detail.achievementRate}
            // 친구 만다라트에서도 지금은 내 마을로 간다. 친구 마을 화면이 생기면 그때 갈린다.
            onOpenVillage={() => navigate('/village')}
            readOnly={readOnly}
            liked={detail.liked}
            likeCount={detail.likeCount}
            onToggleLike={detail.toggleLike}
          />

          {/* 좌: 9x9 2D 뷰 · 우: 3x3 확대 그리드와 선택한 과제 */}
          <div className="sheet-detail-body">
            <SheetGrid
              grid={detail.grid}
              selectedCell={detail.selectedCell}
              onSelect={detail.setSelectedCell}
              heading={null}
              isChecked={detail.isChecked}
              className=""
            />

            <div className="sheet-detail-side">
              <SheetMiniGrid
                blockIndex={detail.selectedBlockIndex}
                cells={detail.miniGrid}
                isChecked={detail.isChecked}
              />
              <SelectedTaskPanel
                task={detail.selectedTask}
                onComplete={detail.completeTask}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
