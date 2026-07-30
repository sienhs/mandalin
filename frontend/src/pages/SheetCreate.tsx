import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import SheetBasicSettings from '../components/sheet/SheetBasicSettings'
import SheetCancelDialog from '../components/sheet/SheetCancelDialog'
import SheetDomainDialog from '../components/sheet/SheetDomainDialog'
import SheetGrid from '../components/sheet/SheetGrid'
import SheetMiniGrid from '../components/sheet/SheetMiniGrid'
import SheetSaveDialog from '../components/sheet/SheetSaveDialog'
import SheetTaskDialog from '../components/sheet/SheetTaskDialog'
import { buildCreatePayload, createSheet } from '../components/sheet/sheet.api'
import { TOTAL_CELLS } from '../components/sheet/sheet.data'
import { useSheetEditor } from '../components/sheet/useSheetEditor'
import './SheetCreate.css'

/** 새 만다라트를 만드는 화면. 좌측 기본 설정 · 우측 2D 뷰와 사이드 패널로 구성된다. */
export default function SheetCreate() {
  const navigate = useNavigate()
  const editor = useSheetEditor()
  const [saveOpen, setSaveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  /**
   * 만다라트를 서버에 저장하고 마을로 넘어간다.
   *
   * 실패하면 다이얼로그를 닫지 않는다 — 닫아버리면 저장된 줄 알고 화면을 떠나 편집 내용을
   * 전부 잃는다(이 화면은 로컬 상태만 들고 있다).
   */
  const submit = async () => {
    if (saving) return

    setSaving(true)
    setSaveError(null)
    try {
      const payload = buildCreatePayload(editor.sheetData, editor.domains, editor.subjects)
      await createSheet(payload)
      setSaveOpen(false)
      navigate('/village')
    } catch (cause: unknown) {
      setSaveError(cause instanceof Error ? cause.message : '만다라트를 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <Header />
      <main className="mx-auto max-w-[1280px] px-6 pb-[70px] pt-6">
        {/* 헤더: 제목 · 저장/취소 */}
        <header className="mb-[18px] flex items-center justify-between gap-4">
          <h1 className="section-title m-0 text-[20px]">새 만다라트 만들기</h1>

          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={() => setCancelOpen(true)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => setSaveOpen(true)}>
              저장 ({editor.filledCount}/{TOTAL_CELLS}칸 완료)
            </Button>
          </div>
        </header>

        {/* 좌: 기본 설정(sticky) · 우: 2D 뷰 */}
        <div className="grid grid-cols-[300px_1fr] items-start gap-5">
          <SheetBasicSettings
            mainGoal={editor.mainGoal}
            onMainGoalChange={editor.changeMainGoal}
            startDate={editor.startDate}
            onStartDateChange={editor.changeStartDate}
            endDate={editor.endDate}
            onEndDateChange={editor.changeEndDate}
            isPublic={editor.isPublic}
            onPublicChange={editor.changePublic}
            onManualTaskCreate={editor.openSelectedCellDialog}
          />

          {/* 우측: 하나의 카드 안에 9x9 그리드 · 저장 경고 · 사이드 패널 */}
          <div className="card grid grid-cols-[1fr_360px] items-start gap-x-6 gap-y-2 p-5">
            {/* 저장 경고 (사이드 컬럼 상단) */}
            <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-1">
              <p className="m-0 whitespace-nowrap text-[11.5px] font-bold text-[#dc3424]">
                한 번 저장하면 목표를 수정할 수 없어요!
              </p>
              {saveError && (
                <p className="m-0 text-[11.5px] font-bold text-[#dc3424]" role="alert">
                  {saveError}
                </p>
              )}
            </div>

            <SheetGrid
              grid={editor.grid}
              selectedCell={editor.selectedCell}
              onSelect={editor.setSelectedCell}
              onOpen={editor.openCellDialog}
            />

            {/* 사이드 패널: 선택한 블록의 3x3 확대 그리드 */}
            <div className="col-start-2 row-start-2">
              <SheetMiniGrid blockIndex={editor.selectedBlockIndex} cells={editor.miniGrid} />
            </div>
          </div>
        </div>
      </main>

      {saveOpen && (
        <SheetSaveDialog
          filledCount={editor.filledCount}
          onClose={() => setSaveOpen(false)}
          onConfirm={() => {
            void submit()
          }}
        />
      )}

      {cancelOpen && <SheetCancelDialog onClose={() => setCancelOpen(false)} />}

      {editor.taskDialogOpen && editor.draft && (
        <SheetTaskDialog
          draft={editor.draft}
          onChange={editor.updateDraft}
          targetCount={editor.targetCountOf(editor.draft.period)}
          onClose={editor.closeDialog}
          onSave={editor.saveDialog}
        />
      )}

      {editor.domainDialogOpen && editor.draft && (
        <SheetDomainDialog
          draft={editor.draft}
          onChange={editor.updateDraft}
          onClose={editor.closeDialog}
          onSave={editor.saveDialog}
        />
      )}
    </div>
  )
}
