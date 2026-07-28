import { useEffect, type FormEvent } from 'react'

type NicknameEditModalProps = {
  nickname: string
  onNicknameChange: (nickname: string) => void
  onCancel: () => void
  onSave: (event: FormEvent<HTMLFormElement>) => void
}

/** 새 닉네임을 입력하고 저장하거나 취소할 수 있는 마이페이지 모달. */
export default function NicknameEditModal({
  nickname,
  onNicknameChange,
  onCancel,
  onSave,
}: NicknameEditModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onCancel])

  return (
    <div
      className="mypage-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section
        className="mypage-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-modal-title"
      >
        <h2 id="nickname-modal-title" className="text-xl font-extrabold">
          닉네임 변경
        </h2>

        <form className="mt-5" onSubmit={onSave}>
          <label
            htmlFor="nickname"
            className="block text-sm font-bold text-slate-400"
          >
            새 닉네임
          </label>
          <input
            id="nickname"
            className="mypage-nickname-input"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            maxLength={20}
            autoFocus
          />

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button type="submit" className="mypage-save-button">
              저장
            </button>
            <button
              type="button"
              className="mypage-outline-button"
              onClick={onCancel}
            >
              취소
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
