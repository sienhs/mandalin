package com.ssafy.mandarin.domain.testaccount.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * 테스트 계정 로그인 요청.
 *
 * <p>상한을 상수로 못 박은 이유: 어노테이션은 컴파일 상수만 받아서
 * {@code TestAccountService.ACCOUNT_COUNT} 를 그대로 쓸 수 없다. 계정 수를 늘리려면 두 곳을
 * 같이 고쳐야 한다 — 범위를 넘긴 값은 서비스에서도 한 번 더 막는다.
 */
@Schema(description = "테스트 계정 로그인 요청")
public record TestLoginRequest(
		@NotNull(message = "슬롯 번호는 필수입니다.")
		@Min(value = 1, message = "슬롯 번호는 1~3 입니다.")
		@Max(value = 3, message = "슬롯 번호는 1~3 입니다.")
		@Schema(description = "테스트 계정 번호", example = "1")
		Integer slot
) {
}
