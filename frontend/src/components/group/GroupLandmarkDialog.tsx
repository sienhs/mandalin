import { useState } from 'react'
import Button from '../common/Button'
import SheetDialog from '../sheet/SheetDialog'
import { cn } from '../../utils/cn'
import type { GroupLandmark } from './group.types'
// 이 팝업의 스타일. 페이지가 아니라 컴포넌트가 직접 불러온다.
import '../../styles/group-setup.css'

type GroupLandmarkDialogProps = {
  landmarks: GroupLandmark[]
  /** 지금 설정된 랜드마크 */
  currentId: number
  /** 적용을 눌렀을 때만 바뀐다 */
  onApply: (buildingId: number) => void
  onClose: () => void
}

/**
 * 그룹 도시 가운데에 놓을 랜드마크를 고르는 팝업.
 *
 * 목록에서 고른 뒤 '적용'을 눌러야 바뀐다 — 누르는 즉시 반영하면 실수로 바꿔놓고
 * 되돌릴 방법이 없다(그룹을 만들 때 한 번 정하는 값이다).
 */
export default function GroupLandmarkDialog({
  landmarks,
  currentId,
  onApply,
  onClose,
}: GroupLandmarkDialogProps) {
  const [pickedId, setPickedId] = useState(currentId)

  return (
    <SheetDialog labelledBy="landmark-dialog-title">
      <div className="group-landmark-dialog">
        <button type="button" onClick={onClose} aria-label="닫기" className="group-landmark-close">
          ✕
        </button>

        <h2 id="landmark-dialog-title" className="group-landmark-dialog-title">
          메인 건물 선택
        </h2>
        <p className="group-landmark-dialog-desc">
          그룹 도시 가장 가운데에 놓일 랜드마크예요.
          <br />
          보유한 랜드마크 중에서 고를 수 있어요.
        </p>

        <ul className="group-landmark-list">
          {landmarks.map((landmark) => (
            <li key={landmark.buildingId}>
              <button
                type="button"
                onClick={() => setPickedId(landmark.buildingId)}
                aria-pressed={landmark.buildingId === pickedId}
                className={cn(
                  'group-landmark-option',
                  landmark.buildingId === pickedId && 'group-landmark-option--picked',
                )}
              >
                <span className="group-landmark-option-icon" aria-hidden="true">
                  {landmark.icon}
                </span>
                <span className="group-landmark-option-name">{landmark.name}</span>
                {landmark.buildingId === pickedId && (
                  <span className="group-landmark-option-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="group-landmark-actions">
          <Button variant="primary" size="lg" className="ui-btn--modal" onClick={() => onApply(pickedId)}>
            적용
          </Button>
          <Button variant="ghost" size="lg" className="ui-btn--modal" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </SheetDialog>
  )
}
