package com.ssafy.mandarin.domain.testaccount.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * 테스트 계정 로그인 요청.
 *
 * <p>아이디 모양(계정 수·접두어)은 여기서 검사하지 않는다. 형식이 틀렸다는 응답과 비밀번호가
 * 틀렸다는 응답이 갈리면, 어떤 아이디가 실재하는지를 응답 차이로 알아낼 수 있다. 두 경우를
 * 서비스에서 같은 오류로 합친다.
 */
@Schema(description = "테스트 계정 로그인 요청")
public record TestLoginRequest(
		@NotBlank(message = "아이디는 필수입니다.")
		@Schema(description = "테스트 계정 아이디", example = "tester1")
		String loginId,

		@NotBlank(message = "비밀번호는 필수입니다.")
		@Schema(description = "테스트 계정 비밀번호")
		String password
) {
}
