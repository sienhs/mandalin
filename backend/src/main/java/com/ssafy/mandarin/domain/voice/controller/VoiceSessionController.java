package com.ssafy.mandarin.domain.voice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.voice.dto.VoiceSessionResponse;
import com.ssafy.mandarin.domain.voice.service.VoiceTicketIssuer;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/voice-sessions")
@RequiredArgsConstructor
@Tag(name = "VoiceSession", description = "AI 음성 코칭 입장 티켓 발급")
public class VoiceSessionController {

	private final VoiceTicketIssuer voiceTicketIssuer;

	@PostMapping
	@Operation(
			summary = "AI 음성 세션 입장 티켓 발급",
			description = """
					AI 음성봇(SFU)에 입장할 단기 티켓을 발급한다. 수명이 2분이라
					화면 진입 시가 아니라 **연결 직전에** 호출해야 한다.

					방과 표시 이름은 티켓 안에서 결정된다 — 클라이언트가 보낸 값은 무시된다.
					티켓은 시그널링 join 메시지 본문으로 보내야 하며, 쿼리스트링에 담으면
					리버스 프록시 액세스 로그에 남는다."""
	)
	public ResponseEntity<ApiResponse<VoiceSessionResponse>> issueTicket(
			@AuthenticationPrincipal CustomUserDetails customUserDetails
	) {
		// SecurityConfig 가 anyRequest().authenticated() 라 여기까지 익명으로 오지는
		// 않지만, null 이면 userId 없이 티켓을 만들게 되므로 명시적으로 막는다.
		if (customUserDetails == null) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED);
		}

		VoiceSessionResponse response = voiceTicketIssuer.issue(
				customUserDetails.getUserId(),
				customUserDetails.getUser().getName()
		);

		return ResponseEntity.ok(ApiResponse.success("음성 세션 티켓이 발급되었습니다.", response));
	}
}
