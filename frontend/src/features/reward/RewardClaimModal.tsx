import Modal from '../../components/common/Modal'
import Button from '../../components/common/ActionButton'
import { IconCoin, IconLandmark, IconVillage } from '../../components/common/Icons'
import type { RewardClaimResult } from '../../data/types'
import { num } from '../../utils/format'
import { pct } from './rewardLabels'

type Props = {
  /**
   * 수령 결과. null 이면 닫힌 상태다.
   *
   * <p><b>이 값이 들어오는 순간이 공개 시점이다.</b> 랜드마크는 무작위라 트랙 응답에는
   * 종류가 없고, 받은 뒤에만 무엇인지 알 수 있다.
   */
  result: RewardClaimResult | null
  /** 받은 구간의 달성률. 제목 아래 한 줄에 쓴다. */
  percent: number | null
  /** 마을 링크에 쓸 시트. 모달은 판정 시트에서만 열리므로 그 시트다. */
  sheetId: number
  onClose: () => void
}

/**
 * 방금 받은 보상을 여는 모달 — <b>공개 연출 전용</b>이다.
 *
 * <p>미리보기(무엇이 걸려 있는가)와 수령 완료 표시는 구간 아이콘의 팝오버가 맡는다. 그쪽은
 * 가리키기만 하면 뜨는 가벼운 정보이고, 이쪽은 무작위 결과가 처음 밝혀지는 순간이라 화면을
 * 덮어 시선을 모을 값이 있다. 둘을 한 모달에 넣어 두면 "잠긴 상자를 눌렀는데 큰 창이 뜨는"
 * 무거운 흐름이 된다.
 */
export default function RewardClaimModal({ result, percent, sheetId, onClose }: Props) {
  if (!result) return null

  const gotLandmarks = result.landmarks.length > 0

  return (
    <Modal
      open
      onClose={onClose}
      title={gotLandmarks ? '랜드마크를 받았어요!' : '크레딧을 받았어요!'}
      description={percent == null ? undefined : `${pct(percent)}% 구간 보상`}
      size="sm"
      footer={
        <>
          {gotLandmarks && (
            <Button
              variant="secondary"
              size="sm"
              to={`/app/village?sheet=${sheetId}`}
              state={{ from: `/app/sheets/${sheetId}` }}
            >
              <IconVillage className="size-[18px]" /> 마을에서 세우기
            </Button>
          )}
          <Button size="sm" onClick={onClose}>
            확인
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`animate-pop grid size-16 shrink-0 place-items-center rounded-2xl text-white ${
            gotLandmarks
              ? 'bg-gradient-to-br from-brand-500 to-brand-700'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
          }`}
        >
          {gotLandmarks ? (
            <IconLandmark className="size-8" />
          ) : (
            <IconCoin className="size-8" />
          )}
        </span>

        <div className="min-w-0">
          {gotLandmarks ? (
            <>
              <p className="m-0 text-[13px] font-bold text-[var(--text-muted)]">
                {result.landmarks.length > 1
                  ? `랜드마크 ${result.landmarks.length}종 해금`
                  : '랜드마크 해금'}
              </p>
              <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
                {result.landmarks.map((landmark, i) => (
                  <li
                    key={landmark.itemKey}
                    className="animate-rise rounded-full bg-[var(--surface-sunken)] px-2.5 py-1 text-[12.5px] font-extrabold"
                    /* 여러 개일 때 한 번에 튀어나오면 몇 개인지 읽히지 않는다.
                       차례로 올라오게 해서 개수가 눈에 남게 한다. */
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    {landmark.name}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="m-0 text-2xl font-black tracking-[-0.04em]">
                +{num(result.grantedPoint ?? 0)}P
              </p>
              <p className="muted m-0 mt-1 text-[12.5px] font-semibold">
                보유 {num(result.currentPoint)}P
              </p>
            </>
          )}
        </div>
      </div>

      {result.fallbackFromLandmark && (
        <p className="muted m-0 mt-4 text-[12.5px] font-semibold leading-relaxed">
          랜드마크를 이미 전부 모았어요. 대신 크레딧으로 드렸습니다.
        </p>
      )}

      {gotLandmarks && (
        <p className="muted m-0 mt-4 text-[12.5px] font-semibold leading-relaxed">
          마을 정중앙 자리에 세울 수 있어요. 과제를 진행할수록 8단계로 자랍니다.
        </p>
      )}
    </Modal>
  )
}
