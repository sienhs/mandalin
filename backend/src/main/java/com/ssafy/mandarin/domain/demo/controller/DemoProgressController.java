package com.ssafy.mandarin.domain.demo.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.demo.dto.DemoProgressRequest;
import com.ssafy.mandarin.domain.demo.service.DemoProgressService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 시연용 진행률 조작 API.
 *
 * <p>과제 수행 체크 API 가 나오기 전까지 마을이 자라는 모습을 보여주기 위한 임시 통로다.
 * 발표 때 배포 환경에서도 써야 해서 프로필로 막지 않고 {@code app.demo.enabled}
 * 스위치로 켜고 끈다(기본 true). 정식 서비스 전에 반드시 끈다.
 */
@RestController
@RequestMapping("/api/v1/demo")
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
@Tag(name = "Demo", description = "시연용 (정식 서비스 전 제거 대상)")
public class DemoProgressController {

	private final DemoProgressService demoProgressService;

	@PatchMapping("/sheets/{sheetId}/progress")
	@Operation(
			summary = "[시연] 시트 진행률 일괄 지정",
			description = "시트의 모든 과제(또는 domainPosition 을 준 경우 해당 도메인만) 진행률을 한 번에 바꾼다. "
					+ "random=true 면 과제마다 임의값을 넣는다. 소유자만 호출할 수 있다."
	)
	public ResponseEntity<ApiResponse<Integer>> applyToSheet(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long sheetId,
			@RequestBody @Valid DemoProgressRequest request
	) {
		int changed = demoProgressService.applyToSheet(userDetails.getUserId(), sheetId, request);
		return ResponseEntity.ok(ApiResponse.success("진행률을 변경했습니다.", changed));
	}

	@PatchMapping("/subjects/{subjectId}/progress")
	@Operation(
			summary = "[시연] 과제 진행률 지정",
			description = "과제 한 건의 진행률(0~100)을 바꾼다. 소유자만 호출할 수 있다."
	)
	public ResponseEntity<ApiResponse<Void>> applyToSubject(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long subjectId,
			@RequestBody @Valid DemoProgressRequest request
	) {
		demoProgressService.applyToSubject(userDetails.getUserId(), subjectId, request);
		return ResponseEntity.ok(ApiResponse.success("진행률을 변경했습니다."));
	}
}
