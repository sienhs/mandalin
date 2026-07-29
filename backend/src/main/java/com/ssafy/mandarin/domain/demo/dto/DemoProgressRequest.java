package com.ssafy.mandarin.domain.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 시연용 진행률 지정 요청.
 *
 * <p>{@code random} 이 true 면 {@code progress} 는 무시하고 과제마다 임의값을 넣는다 —
 * 마을이 골고루 자란 모습을 한 번에 만들기 위한 것이다.
 */
@Schema(description = "시연용 진행률 지정")
public record DemoProgressRequest(
		@Schema(description = "적용할 진행률 0~100. random 이 true 면 무시된다.", example = "70")
		@Min(0) @Max(100) Integer progress,

		@Schema(description = "과제마다 임의 진행률을 넣을지", example = "false")
		Boolean random,

		@Schema(description = "특정 도메인만 바꿀 때의 position(0~7). 비우면 시트 전체.", nullable = true, example = "3")
		Integer domainPosition
) {

	public boolean isRandom() {
		return Boolean.TRUE.equals(random);
	}
}
