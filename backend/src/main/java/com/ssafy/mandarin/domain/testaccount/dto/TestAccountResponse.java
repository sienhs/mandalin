package com.ssafy.mandarin.domain.testaccount.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 로그인 화면에 뿌릴 테스트 계정 한 줄.
 *
 * @param slot 로그인에 쓰는 번호(1~3)
 * @param name 표시 이름(테스터1 …)
 * @param uuid 친구 코드. 테스터끼리 친구 요청을 보내 볼 수 있도록 같이 내려준다
 */
@Schema(description = "테스트 계정")
public record TestAccountResponse(
		@Schema(description = "로그인 슬롯", example = "1") int slot,
		@Schema(description = "표시 이름", example = "테스터1") String name,
		@Schema(description = "친구 코드(uuid)", example = "tester-1") String uuid
) {
}
