package com.ssafy.mandarin.domain.demo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 시연용 해금 결과.
 *
 * <p>{@code granted} 만 돌려주면 두 번째 호출이 0 을 반환해 "실패한 것처럼" 보인다.
 * 이미 다 갖고 있어서 0 인지, 해금할 게 없어서 0 인지를 화면이 구분할 수 있도록
 * 보유 수와 전체 수를 같이 준다.
 */
@Schema(description = "시연용 해금 결과")
public record DemoUnlockResponse(
		@Schema(description = "이번 호출로 새로 지급된 종수", example = "12") int granted,
		@Schema(description = "지급 후 보유 종수", example = "13") int owned,
		@Schema(description = "카탈로그의 전체 종수", example = "13") int total
) {
}
