import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import SheetCreateConfirmDialog from '../components/sheetList/SheetCreateConfirmDialog'
import SheetDeleteDialog from '../components/sheetList/SheetDeleteDialog'
import SheetGroupCard from '../components/sheetList/SheetGroupCard'
import SheetInviteDialog from '../components/sheetList/SheetInviteDialog'
import SheetListCard from '../components/sheetList/SheetListCard'
import { GROUP_INVITES, GROUP_SHEETS, MY_SHEETS } from '../components/sheetList/sheetList.data'
import type { SheetSummary } from '../components/sheetList/sheetList.types'
import '../styles/sheet-list.css'

/** 내 만다라트 목록 화면. 개인 만다라트 카드 목록과 그룹 만다라트 목록으로 구성된다. */
export default function SheetList() {
  const navigate = useNavigate()
  const [sheets, setSheets] = useState(MY_SHEETS)
  const [invites, setInvites] = useState(GROUP_INVITES)
  const groups = GROUP_SHEETS

  const [createOpen, setCreateOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  /** 삭제 확인 중인 만다라트. null 이면 팝업이 닫힌 상태. */
  const [deleteTarget, setDeleteTarget] = useState<SheetSummary | null>(null)

  const confirmDelete = () => {
    if (!deleteTarget) return
    setSheets((prev) => prev.filter((sheet) => sheet.sheetId !== deleteTarget.sheetId))
    setDeleteTarget(null)
  }

  const removeInvite = (groupId: number) => {
    setInvites((prev) => prev.filter((invite) => invite.groupId !== groupId))
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
                onClick={() => setInviteOpen(true)}
                className="sheet-list-btn-lavender"
              >
                초대 요청
              </button>
              {invites.length > 0 && (
                <span className="sheet-list-dot" aria-label={`새 초대 ${invites.length}건`} />
              )}
            </div>

            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              만다라트 생성
            </Button>
          </div>
        </header>

        {/* 개인 만다라트 카드 목록 */}
        <section aria-label="내 만다라트">
          {sheets.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sheets.map((sheet) => (
                <li key={sheet.sheetId}>
                  <SheetListCard
                    sheet={sheet}
                    onOpen={(sheetId) => navigate(`/sheet/${sheetId}`)}
                    onRemove={() => setDeleteTarget(sheet)}
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
            <Button variant="primary" onClick={() => navigate('/sheet/create?type=group')}>
              그룹 생성
            </Button>
          </div>

          {groups.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {groups.map((group) => (
                <li key={group.groupId}>
                  <SheetGroupCard
                    group={group}
                    onMove={(groupId) => navigate(`/sheet/group/${groupId}`)}
                  />
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

      {createOpen && (
        <SheetCreateConfirmDialog
          onConfirm={() => navigate('/sheet/create')}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {deleteTarget && (
        <SheetDeleteDialog
          title={deleteTarget.title}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {inviteOpen && (
        <SheetInviteDialog
          invites={invites}
          onAccept={removeInvite}
          onReject={removeInvite}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  )
}
