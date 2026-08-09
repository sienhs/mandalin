package com.ssafy.mandarin.domain.testaccount.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * 테스트 계정에 심는 만다라트 두 장의 <b>진행률과 순서</b>.
 *
 * <p>이 값들은 시연에서 무엇을 보여줄 수 있는지를 그대로 정한다. 그런데 어긋나도 서버는 정상
 * 기동하고 화면에도 에러가 나지 않는다 — 로그인해서 눈으로 세어 보기 전까지 아무도 모른다.
 * 그래서 고정한다.
 *
 * <p>특히 <b>순서</b>가 중요하다. 마일스톤 보상은 가장 먼저 만든 시트로만 판정하므로
 * ({@code RewardTrackService.findBoundSheet}), 순서가 뒤집히면 판정 시트가 50% 짜리가 되어
 * 열리는 구간이 여덟에서 넷으로 줄어든다.
 */
class TestSheetBlueprintTest {

	private static final int SLOTS = 8;
	private static final int TOTAL_SUBJECTS = SLOTS * SLOTS;

	/** 청사진 한 장의 진행률 평균(%) — 서버가 계산하는 {@code progress} 와 같은 정의다. */
	private static double progressOf(TestSheetBlueprint.SheetSpec sheet) {
		return sheet.domains().stream()
				.flatMap(domain -> domain.progress().stream())
				.mapToInt(Integer::intValue)
				.average()
				.orElse(0.0);
	}

	@DisplayName("두 장을 심고, 100% 시트가 먼저다 — 보상 판정 시트가 되어야 한다")
	@Test
	void 순서() {
		List<TestSheetBlueprint.SheetSpec> all = TestSheetBlueprint.all();

		assertThat(all).hasSize(2);
		assertThat(progressOf(all.get(0))).isEqualTo(100.0);
		assertThat(progressOf(all.get(1))).isEqualTo(50.0);
	}

	/**
	 * 0 과 100 만 쓰는 이유는 {@code TestSheetBlueprint.done(int)} 주석에 있다 — 중간값은
	 * {@code tryCount} 로 역산했다 되돌아올 때 반올림 오차가 남아 100.0 · 50.0 이 깨진다.
	 */
	@DisplayName("진행률은 0 아니면 100 만 쓴다 — 중간값은 왕복에서 어긋난다")
	@Test
	void 중간값_없음() {
		for (TestSheetBlueprint.SheetSpec sheet : TestSheetBlueprint.all()) {
			assertThat(sheet.domains())
					.flatExtracting(TestSheetBlueprint.DomainSpec::progress)
					.containsAnyOf(0, 100)
					.allMatch(progress -> progress == 0 || progress == 100);
		}
	}

	@DisplayName("81칸이 다 채워져 있다 — 구역 8개, 구역마다 과제 8개, 진행률도 8개")
	@Test
	void 칸수() {
		for (TestSheetBlueprint.SheetSpec sheet : TestSheetBlueprint.all()) {
			assertThat(sheet.domains()).hasSize(SLOTS);
			for (TestSheetBlueprint.DomainSpec domain : sheet.domains()) {
				assertThat(domain.tasks()).hasSize(SLOTS);
				assertThat(domain.progress()).hasSize(SLOTS);
			}
		}
	}

	/**
	 * 50% 시트는 <b>구역마다 진행률이 달라야</b> 한다. 32칸을 구역당 4칸씩 고르게 나눠도 시트
	 * 진행률은 같은 50% 지만, 리포트의 "잘하고 있는 것 / 챙길 것" 과 도메인별 달성률 막대가
	 * 전부 같은 높이가 되어 그 화면들이 아무것도 보여주지 못한다.
	 */
	@DisplayName("50% 시트는 구역 진행률이 100%부터 0%까지 흩어져 있다")
	@Test
	void 오십퍼_시트는_구역별로_다르다() {
		TestSheetBlueprint.SheetSpec half = TestSheetBlueprint.all().get(1);

		List<Integer> doneCounts = half.domains().stream()
				.map(domain -> (int) domain.progress().stream().filter(p -> p == 100).count())
				.toList();

		assertThat(doneCounts).containsExactly(8, 7, 6, 5, 3, 2, 1, 0);
		assertThat(doneCounts.stream().mapToInt(Integer::intValue).sum()).isEqualTo(TOTAL_SUBJECTS / 2);
	}

	@DisplayName("100% 시트는 64칸이 전부 완료다 — 마지막 구간까지 열려야 한다")
	@Test
	void 백퍼_시트는_전부_완료다() {
		TestSheetBlueprint.SheetSpec full = TestSheetBlueprint.all().get(0);

		assertThat(full.domains())
				.flatExtracting(TestSheetBlueprint.DomainSpec::progress)
				.hasSize(TOTAL_SUBJECTS)
				.allMatch(progress -> progress == 100);
	}
}
