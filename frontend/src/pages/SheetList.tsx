import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'
import SheetGroupCard from '../components/sheetList/SheetGroupCard'
import SheetListCard from '../components/sheetList/SheetListCard'
import { GROUP_SHEETS, MY_SHEETS } from '../components/sheetList/sheetList.data'
import './SheetList.css'

/** 내 만다라트 목록 화면. 개인 만다라트 카드 목록과 그룹 만다라트 목록으로 구성된다. */
export default function SheetList() {
  const navigate = useNavigate()
  // TODO: GET /api/sheets 연동 시 목업 상태를 서버 데이터로 교체
  const [sheets, setSheets] = useState(MY_SHEETS)
  const groups = GROUP_SHEETS

  const removeSheet = (id: number) => {
    // TODO: 삭제 확인 팝업 · DELETE /api/sheets/{id} 연결
    setSheets((prev) => prev.filter((sheet) => sheet.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-6 pb-[70px] pt-8">
        {/* 제목 · 초대 요청 · 만다라트 생성 */}
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="sheet-list-heading">내 만다라트 목록</h1>
            <p className="sheet-list-caption">만다라트 생성</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => navigate('/friends')}
                className="sheet-list-btn sheet-list-btn-ghost"
              >
                초대 요청
              </button>
              {/* TODO: 안 읽은 초대가 있을 때만 노출 */}
              <span className="sheet-list-dot" aria-label="새 초대 요청 있음" />
            </div>

            <button
              type="button"
              onClick={() => navigate('/sheet/create')}
              className="sheet-list-btn sheet-list-btn-primary"
            >
              만다라트 생성
            </button>
          </div>
        </header>

        {/* 개인 만다라트 카드 목록 */}
        <section aria-label="내 만다라트">
          {sheets.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sheets.map((sheet) => (
                <li key={sheet.id}>
                  <SheetListCard
                    sheet={sheet}
                    onOpen={(id) => navigate(`/sheet/${id}`)}
                    onRemove={removeSheet}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 py-14 text-center text-[13.5px] font-semibold text-ink-400">
              아직 만든 만다라트가 없어요. 오른쪽 위에서 새로 만들어보세요.
            </p>
          )}
        </section>

        {/* 그룹 만다라트 */}
        <section aria-labelledby="group-sheets" className="mt-9">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 id="group-sheets" className="sheet-list-subheading">
              그룹 만다라트
            </h2>
            <button
              type="button"
              onClick={() => navigate('/sheet/create?type=group')}
              className="sheet-list-btn sheet-list-btn-primary"
            >
              그룹 생성
            </button>
          </div>

          {groups.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {groups.map((group) => (
                <li key={group.id}>
                  <SheetGroupCard group={group} onMove={(id) => navigate(`/sheet/group/${id}`)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 py-10 text-center text-[13.5px] font-semibold text-ink-400">
              참여 중인 그룹 만다라트가 없어요.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
