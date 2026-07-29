package com.ssafy.mandarin.domain.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** 시연용 포인트 지급 요청. */
@Schema(description = "시연용 포인트 지급")
public record DemoPointRequest(
		/*
		 * 상한을 두는 이유: 실수로 큰 값을 보내면 int 범위를 넘겨 잔액이 음수로 돌아버린다.
		 * 시연에 100만이면 충분하다(가장 비싼 건물이 300P).
		 */
		@Schema(description = "지급할 포인트", example = "50000")
		@NotNull @Min(1) @Max(1_000_000) Integer amount
) {
}
