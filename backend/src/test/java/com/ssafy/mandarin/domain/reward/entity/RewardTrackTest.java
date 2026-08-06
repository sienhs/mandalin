package com.ssafy.mandarin.domain.reward.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.stream.IntStream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * 보상 표.
 *
 * <p>이 표는 <b>기획이 합의한 값</b>이고 코드로만 존재한다. 누가 한 칸을 바꾸면 지급되는 것이
 * 달라지는데 화면에는 아무 에러도 나지 않으므로, 표 자체를 고정해 둔다.
 */
class RewardTrackTest {

	@DisplayName("구간별 보상 종류 — 앞 둘은 크레딧, 3구간부터 번갈아, 마지막은 랜드마크")
	@ParameterizedTest(name = "{0}구간({1}%) → {2}")
	@CsvSource({
			"1,  12.5, CREDIT",
			"2,  25.0, CREDIT",
			"3,  37.5, LANDMARK",
			"4,  50.0, CREDIT",
			"5,  62.5, LANDMARK",
			"6,  75.0, CREDIT",
			"7,  87.5, LANDMARK",
			"8, 100.0, LANDMARK",
	})
	void 구간별_보상(int milestone, double percent, RewardKind kind) {
		assertThat(RewardTrack.kindOf(milestone)).isEqualTo(kind);
		assertThat(RewardTrack.percentOf(milestone)).isEqualTo(percent);
	}

	@DisplayName("크레딧과 랜드마크가 각각 네 번이다")
	@Test
	void 보상_개수() {
		long credits = IntStream.rangeClosed(1, RewardTrack.MILESTONE_COUNT)
				.filter(m -> RewardTrack.kindOf(m) == RewardKind.CREDIT)
				.count();
		long landmarks = RewardTrack.MILESTONE_COUNT - credits;

		assertThat(credits).isEqualTo(4);
		assertThat(landmarks).isEqualTo(4);
	}

	/**
	 * 마지막 구간이 랜드마크가 아니면 <b>13종 중 일부가 영영 도달 불가</b>가 된다 —
	 * 마지막 구간만 남은 전종을 주기 때문이다.
	 */
	@DisplayName("마지막 구간은 반드시 랜드마크다 — 남은 전종을 주는 자리")
	@Test
	void 마지막은_랜드마크() {
		assertThat(RewardTrack.kindOf(RewardTrack.MILESTONE_COUNT)).isEqualTo(RewardKind.LANDMARK);
		assertThat(RewardTrack.isFinal(RewardTrack.MILESTONE_COUNT)).isTrue();
		assertThat(RewardTrack.isFinal(RewardTrack.MILESTONE_COUNT - 1)).isFalse();
	}

	@DisplayName("구간 8개가 100% 를 정확히 나눈다 — 마지막이 100 이 아니면 완성해도 못 받는다")
	@Test
	void 마지막_구간은_정확히_100() {
		assertThat(RewardTrack.percentOf(RewardTrack.MILESTONE_COUNT)).isEqualTo(100.0);
		assertThat(RewardTrack.STEP_PERCENT * RewardTrack.MILESTONE_COUNT).isEqualTo(100.0);
	}

	@DisplayName("구간 번호는 1~8 만 유효하다")
	@Test
	void 유효_범위() {
		assertThat(RewardTrack.isValid(0)).isFalse();
		assertThat(RewardTrack.isValid(9)).isFalse();
		assertThat(IntStream.rangeClosed(1, 8).allMatch(RewardTrack::isValid)).isTrue();
	}

	/**
	 * 크레딧 보상액이 일일 상한과 같다는 사실을 테스트로 남긴다.
	 *
	 * <p>같은 값이라 지급을 상한 경로로 하면 <b>그날 과제를 한 유저는 0원을 받는다</b>. 누가
	 * 나중에 지급을 `SubjectService` 쪽으로 합치려 할 때 이 테스트가 그 함정을 상기시킨다.
	 * 상한이 바뀌면 이 테스트가 깨지고, 그때 보상액을 다시 판단하면 된다.
	 */
	@DisplayName("크레딧 보상액이 일일 포인트 상한과 같다 — 지급이 상한을 우회해야 하는 이유")
	@Test
	void 크레딧이_일일상한과_같다() {
		assertThat(RewardTrack.CREDIT_AMOUNT)
				.isEqualTo((int) com.ssafy.mandarin.domain.subject.service.SubjectService.DAILY_POINT_LIMIT);
	}

	@DisplayName("표에 빈 칸이 없다")
	@Test
	void 표가_완전하다() {
		assertThat(IntStream.rangeClosed(1, RewardTrack.MILESTONE_COUNT)
				.mapToObj(RewardTrack::kindOf)
				.toList())
				.hasSize(RewardTrack.MILESTONE_COUNT)
				.allSatisfy(kind -> assertThat(Arrays.asList(RewardKind.values())).contains(kind));
	}
}
