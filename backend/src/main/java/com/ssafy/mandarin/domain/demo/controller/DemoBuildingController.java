package com.ssafy.mandarin.domain.demo.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.demo.dto.DemoUnlockResponse;
import com.ssafy.mandarin.domain.demo.service.DemoBuildingService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 시연용 건물 해금 API.
 *
 * <p>랜드마크는 만다라트 완성 보상으로 줄 예정이라 상점 구매 대상이 아니다. 보상 지급이
 * 붙기 전까지 정중앙 3×3 을 검수할 방법이 없어서 임시 해금 통로를 둔다.
 * {@code app.demo.enabled} 로 시연용 API 전체와 함께 꺼진다.
 */
@RestController
@RequestMapping("/api/v1/demo")
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
@Tag(name = "Demo", description = "시연용 (정식 서비스 전 제거 대상)")
public class DemoBuildingController {

	private final DemoBuildingService demoBuildingService;

	@PostMapping("/buildings/landmarks")
	@Operation(
			summary = "[시연] 랜드마크 전 종 해금",
			description = "로그인한 본인 계정에 type=LANDMARK 건물 전부를 지급한다. 포인트를 쓰지 않는다 "
					+ "(랜드마크는 상점 재화가 아니라 만다라트 완성 보상이다). 이미 보유한 종은 건너뛰므로 "
					+ "여러 번 호출해도 안전하다. 정식 서비스에서는 DEMO_ENABLED=false 로 비활성화된다."
	)
	public ResponseEntity<ApiResponse<DemoUnlockResponse>> unlockLandmarks(
			@AuthenticationPrincipal CustomUserDetails userDetails
	) {
		DemoUnlockResponse result = demoBuildingService.unlockAllLandmarks(userDetails.getUserId());
		return ResponseEntity.ok(ApiResponse.success("랜드마크를 해금했습니다.", result));
	}
}
