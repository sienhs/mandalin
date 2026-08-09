package com.ssafy.mandarin.domain.reward.dto;

import java.util.List;

import com.ssafy.mandarin.domain.reward.entity.RewardKind;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * 보상 트랙 현황.
 *
 * <p>구간 8개를 <b>도달·수령 여부와 함께</b> 한 번에 준다. 프론트가 진행률만 받아 구간을 다시
 * 계산하게 두면 12.5% 라는 규칙이 양쪽에 복제되고, 한쪽만 고쳤을 때 화면과 지급이 어긋난다.
 */
@Builder
@Schema(description = "만다라트 진행률 마일스톤 보상 트랙")
public record RewardTrackResponse(

		@Schema(
				description = "보상 판정에 쓰는 시트(가장 먼저 만든 시트). 이 시트에만 선물상자를 그린다. "
						+ "시트가 없으면 null",
				example = "12"
		)
		Long sheetId,

		/**
		 * 판정 시트의 진행률(%).
		 *
		 * <p>이름은 {@code achievementRate} 지만 담기는 값은 <b>{@code progress}</b>(과제별
		 * 진행률의 평균)다 — 화면의 진행률 링·랜드마크 성장 단계와 같은 수다. 이름을 그대로 둔
		 * 것은 프론트가 이 필드명을 쓰고 있어서이고, 값의 정의는
		 * {@code RewardTrackService.rewardRateOf} 가 정본이다.
		 */
		@Schema(description = "판정 시트의 진행률(%). 화면의 진행률 링과 같은 값", example = "37.5")
		Double achievementRate,

		List<MilestoneResponse> milestones
) {

	@Builder
	@Schema(description = "구간 하나")
	public record MilestoneResponse(

			@Schema(description = "구간 번호 1~8", example = "3")
			Integer milestone,

			@Schema(description = "도달에 필요한 달성률(%)", example = "37.5")
			Double percent,

			@Schema(example = "LANDMARK")
			RewardKind kind,

			@Schema(description = "CREDIT 구간의 지급 포인트. LANDMARK 면 null", example = "1000")
			Integer creditAmount,

			@Schema(description = "달성률이 이 구간을 넘었는가", example = "true")
			Boolean reached,

			@Schema(description = "이미 수령했는가", example = "false")
			Boolean claimed,

			@Schema(description = "수령했다면 받은 포인트", example = "1000")
			Integer grantedPoint,

			@Schema(
					description = "수령했다면 받은 랜드마크 이름. 마지막 구간은 여러 개일 수 있다",
					example = "[\"개선문 광장\"]"
			)
			List<String> grantedNames
	) {
	}
}
