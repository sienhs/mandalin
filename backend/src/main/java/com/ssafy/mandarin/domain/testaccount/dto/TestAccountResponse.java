package com.ssafy.mandarin.domain.testaccount.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 발급된 테스트 계정 한 줄.
 *
 * <p><b>비밀번호는 담지 않는다.</b> 이 목록은 로그인 전에 누구나 부를 수 있는 응답이라, 여기에
 * 비밀번호가 실리면 로그인 절차 자체가 의미를 잃는다. 비밀번호는 계정을 나눠 주는 사람이
 * 따로 전달한다({@code TEST_LOGIN_PASSWORD}).
 *
 * @param loginId 로그인에 쓰는 아이디
 * @param name    표시 이름(테스터1 …)
 * @param uuid    친구 코드. 테스터끼리 친구 요청을 보내 볼 수 있도록 같이 내려준다
 */
@Schema(description = "테스트 계정")
public record TestAccountResponse(
		@Schema(description = "로그인 아이디", example = "tester1") String loginId,
		@Schema(description = "표시 이름", example = "테스터1") String name,
		@Schema(description = "친구 코드(uuid)", example = "tester-1") String uuid
) {
}
