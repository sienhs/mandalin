import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/common/Header'
import SheetGrid from '../components/sheet/SheetGrid'
import SheetMiniGrid from '../components/sheet/SheetMiniGrid'
import SelectedTaskPanel from '../components/sheetDetail/SelectedTaskPanel'
import SheetDetailHeader from '../components/sheetDetail/SheetDetailHeader'
import { useSheetDetail } from '../components/sheetDetail/useSheetDetail'
// 카드(.card) · 9x9 칸(.Sheet) · 3x3 확대 그리드(.mgrid) · 배지(.pill) 는 생성 화면과 공유한다.
import '../styles/sheet-create.css'

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

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-6 pb-[70px] pt-6">
        <div className="card p-6">
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
          <div className="grid grid-cols-[1fr_360px] items-start gap-6">
            <SheetGrid
              grid={detail.grid}
              selectedCell={detail.selectedCell}
              onSelect={detail.setSelectedCell}
              heading={null}
              isChecked={detail.isChecked}
              className=""
            />

            <div className="flex flex-col gap-4">
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
