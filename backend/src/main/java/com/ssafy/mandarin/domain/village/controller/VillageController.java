package com.ssafy.mandarin.domain.village.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.village.dto.VillageResponse;
import com.ssafy.mandarin.domain.village.service.VillageService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/village")
@RequiredArgsConstructor
@Tag(name = "Village", description = "내 마을")
public class VillageController {

	private final VillageService villageService;

	@GetMapping("/me")
	@Operation(
			summary = "내 마을 조회",
			description = "배치 가능한 보유 건물을 3D 모델링 parts 와 함께 반환한다. "
					+ "미보유 건물의 모델링은 응답에 포함되지 않는다."
	)
	public ResponseEntity<ApiResponse<VillageResponse>> getMyVillage(
			@AuthenticationPrincipal CustomUserDetails userDetails
	) {
		VillageResponse village = villageService.getMyVillage(userDetails.getUserId());
		return ResponseEntity.ok(ApiResponse.success("Village loaded", village));
	}
}
