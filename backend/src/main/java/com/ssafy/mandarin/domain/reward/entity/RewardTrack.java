package com.ssafy.mandarin.domain.reward.entity;

/**
 * 마일스톤 보상 표 — **이 규칙의 유일한 정본.**
 *
 * <p>만다라트 진행률을 12.5% 씩 8구간으로 나누고, 각 구간에 크레딧이나 랜드마크를 붙인다.
 * 12.5% 라는 폭은 임의로 정한 것이 아니라 <b>세부 목표가 8개</b>라서다 — 프론트의
 * {@code landmarkStageFromPercent} 가 같은 폭으로 랜드마크 단계를 정하므로, 구간 하나를
 * 넘길 때마다 "랜드마크가 한 단계 자라고 보상이 하나 열린다" 가 된다.
 *
 * <p>이 등식은 <b>양쪽이 같은 수를 볼 때만</b> 성립한다. 랜드마크 단계는 줄곧
 * {@code progress}(과제별 진행률의 평균)를 봤는데 보상 판정만 {@code achievementRate}(완료
 * 과제 ÷ 64)를 보던 시절이 있었고, 그때는 링이 48% 인데 12.5% 구간만 열렸다. 지금은 판정도
 * {@code progress} 다({@code RewardTrackService.rewardRateOf}).
 *
 * <pre>
 *   구간      1      2      3      4      5      6      7      8
 *   진행률  12.5   25.0   37.5   50.0   62.5   75.0   87.5  100.0 %
 *   보상    크레딧 크레딧 랜드마크 크레딧 랜드마크 크레딧 랜드마크 랜드마크(남은 전종)
 * </pre>
 *
 * <p>앞 두 구간을 크레딧으로 둔 이유는 시작 직후에 랜드마크가 나오면 희소성이 사라지기
 * 때문이고, 3구간부터 번갈아 가되 <b>마지막은 랜드마크</b>다. 8구간에서 3구간부터 번갈아
 * 시작하면 7구간이 랜드마크로 끝나므로, 마지막을 랜드마크로 두면 7·8 구간이 연달아 랜드마크가
 * 된다 — 그게 완성 직전 구간의 무게를 만든다.
 *
 * <p><b>8구간(100%)은 남은 랜드마크 전종을 준다.</b> 랜덤 지급이 세 번뿐이면 13종 중 4종만
 * 도달 가능해 나머지가 사장된다. 만다라트를 완성하면 컬렉션도 완성되게 두면 13종 전부가
 * 의미를 갖는다.
 */
public final class RewardTrack {

	/** 구간 수. 세부 목표 8개와 같다. */
	public static final int MILESTONE_COUNT = 8;

	/** 구간 하나의 폭(%). {@code 100 / MILESTONE_COUNT}. */
	public static final double STEP_PERCENT = 100.0 / MILESTONE_COUNT;

	/**
	 * 크레딧 보상 금액.
	 *
	 * <p>⚠️ {@code SubjectService.DAILY_POINT_LIMIT} 와 같은 값(1000)이다. 그래서 이 보상을
	 * 과제 수행 경로로 지급하면 <b>그날 과제를 하나라도 한 유저는 0원을 받는다</b> —
	 * 구간 도달은 과제를 수행해야 일어나므로 사실상 항상 그렇다. 일일 상한은 "같은 과제를
	 * 반복해 파밍하는 것" 을 막는 장치이고 마일스톤 보상은 그 대상이 아니라, 지급은 상한을
	 * 거치지 않는 경로로 한다({@code RewardTrackService.claim}).
	 */
	public static final int CREDIT_AMOUNT = 1000;

	/** 구간별 보상 종류. 인덱스 0 = 1구간. */
	private static final RewardKind[] KINDS = {
			RewardKind.CREDIT,    // 1구간 12.5%
			RewardKind.CREDIT,    // 2구간 25.0%
			RewardKind.LANDMARK,  // 3구간 37.5%
			RewardKind.CREDIT,    // 4구간 50.0%
			RewardKind.LANDMARK,  // 5구간 62.5%
			RewardKind.CREDIT,    // 6구간 75.0%
			RewardKind.LANDMARK,  // 7구간 87.5%
			RewardKind.LANDMARK,  // 8구간 100.0% — 남은 전종
	};

	private RewardTrack() {
	}

	/** 구간 번호(1~8)가 유효한가. */
	public static boolean isValid(int milestone) {
		return milestone >= 1 && milestone <= MILESTONE_COUNT;
	}

	/** 구간 번호(1~8) → 보상 종류. */
	public static RewardKind kindOf(int milestone) {
		return KINDS[milestone - 1];
	}

	/** 구간 번호(1~8) → 도달에 필요한 진행률(%). */
	public static double percentOf(int milestone) {
		return STEP_PERCENT * milestone;
	}

	/**
	 * 마지막 구간인가 — 남은 랜드마크 전종을 주는 구간.
	 *
	 * <p>구간 번호로 판정하지 않고 여기서 묻게 한 이유는, 표를 고쳐 구간 수가 바뀌어도
	 * 부르는 쪽이 그대로 남게 하려는 것이다.
	 */
	public static boolean isFinal(int milestone) {
		return milestone == MILESTONE_COUNT;
	}
}
