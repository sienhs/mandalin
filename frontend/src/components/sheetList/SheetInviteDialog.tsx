import Button from '../common/Button'
import SheetListDialog from './SheetListDialog'
import type { GroupInvite } from './sheetList.types'

type SheetInviteDialogProps = {
  invites: GroupInvite[]
  onAccept: (groupId: number) => void
  onReject: (groupId: number) => void
  onClose: () => void
}

/** 받은 그룹 초대를 확인하고 수락 · 거절하는 팝업 */
export default function SheetInviteDialog({
  invites,
  onAccept,
  onReject,
  onClose,
}: SheetInviteDialogProps) {
  return (
    <SheetListDialog
      labelledBy="group-invite-title"
      className="sheet-list-dialog--invite"
      onClose={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="sheet-list-dialog-close"
      >
        ✕
      </button>

      <div>
        <h2 id="group-invite-title" className="sheet-list-dialog-title">
          그룹 초대
        </h2>
        <p className="sheet-list-dialog-desc mt-1">
          받은 그룹 만다라트 초대를 확인하고 수락해보세요
        </p>
      </div>

      {invites.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {invites.map((invite) => (
            <li key={invite.groupId} className="invite-item">
              <div className="min-w-0">
                <h3 className="invite-title">{invite.groupTitle}</h3>
                <p className="invite-from">
                  <b>{invite.inviterName}</b>님의 초대
                </p>
              </div>

              <div className="invite-actions">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAccept(invite.groupId)}
                  className="flex-1"
                >
                  수락하기
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(invite.groupId)}
                  className="flex-1"
                >
                  거절
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 py-8 text-center text-[13px] font-semibold text-ink-400">
          받은 초대가 없어요.
        </p>
      )}
    </SheetListDialog>
  )
}
