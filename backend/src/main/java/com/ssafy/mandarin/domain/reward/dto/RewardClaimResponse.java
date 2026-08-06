package com.ssafy.mandarin.domain.reward.dto;

import java.util.List;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.reward.entity.RewardKind;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * 수령 결과 — **무엇을 받았는지 여기서 처음 밝혀진다.**
 *
 * <p>랜드마크는 무작위라 누르기 전에는 종류를 알 수 없다. 그래서 트랙 조회 응답에는 "랜드마크
 * 구간" 이라는 사실만 있고, 어떤 종인지는 이 응답에만 담긴다 — 화면이 이걸로 공개 연출을 한다.
 */
@Builder
@Schema(description = "마일스톤 보상 수령 결과")
public record RewardClaimResponse(

		@Schema(description = "수령한 구간 1~8", example = "3")
		Integer milestone,

		@Schema(description = "실제로 지급된 종류", example = "LANDMARK")
		RewardKind kind,

		@Schema(description = "CREDIT 이면 지급 포인트", example = "1000")
		Integer grantedPoint,

		@Schema(description = "LANDMARK 면 지급된 건물. 마지막 구간은 남은 전종이라 여러 개다")
		List<LandmarkResponse> landmarks,

		@Schema(description = "지급 후 보유 포인트. 헤더 갱신에 쓴다", example = "4200")
		Integer currentPoint,

		@Schema(
				description = "랜드마크 구간인데 이미 전종을 보유해 크레딧으로 대체 지급했는가. "
						+ "화면이 그 사실을 알려 주기 위해 필요하다",
				example = "false"
		)
		Boolean fallbackFromLandmark
) {

	@Builder
	@Schema(description = "지급된 랜드마크")
	public record LandmarkResponse(
			@Schema(example = "17") Long itemId,
			@Schema(example = "lm_triumph_arch") String itemKey,
			@Schema(example = "개선문 광장") String name,
			String thumbnailUrl
	) {

		public static LandmarkResponse from(BuildingItem item) {
			return LandmarkResponse.builder()
					.itemId(item.getId())
					.itemKey(item.getItemKey())
					.name(item.getName())
					.thumbnailUrl(item.getThumbnailUrl())
					.build();
		}
	}
}
