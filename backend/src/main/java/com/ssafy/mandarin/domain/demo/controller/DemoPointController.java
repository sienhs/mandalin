package com.ssafy.mandarin.domain.demo.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.demo.dto.DemoPointRequest;
import com.ssafy.mandarin.domain.demo.service.DemoPointService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 시연용 포인트 지급 API.
 *
 * <p>포인트 적립이 구현되기 전까지 상점 구매 흐름을 보여주기 위한 임시 통로다.
 * {@code app.demo.enabled} 로 시연용 API 전체와 함께 꺼진다.
 */
@RestController
@RequestMapping("/api/v1/demo")
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
@Tag(name = "Demo", description = "시연용 (정식 서비스 전 제거 대상)")
public class DemoPointController {

	private final DemoPointService demoPointService;

	@PostMapping("/points")
	@Operation(
			summary = "[시연] 내 계정에 포인트 지급",
			description = "로그인한 본인 계정에만 지급한다. 지급 후 잔액을 반환한다. "
					+ "정식 서비스에서는 DEMO_ENABLED=false 로 비활성화된다."
	)
	public ResponseEntity<ApiResponse<Integer>> grant(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@RequestBody @Valid DemoPointRequest request
	) {
		int balance = demoPointService.grant(userDetails.getUserId(), request.amount());
		return ResponseEntity.ok(ApiResponse.success("포인트를 지급했습니다.", balance));
	}
}
