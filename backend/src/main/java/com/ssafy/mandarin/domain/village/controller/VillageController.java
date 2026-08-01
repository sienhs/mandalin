package com.ssafy.mandarin.domain.village.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.village.dto.TerrainUpdateRequest;
import com.ssafy.mandarin.domain.village.dto.VillageResponse;
import com.ssafy.mandarin.domain.village.entity.Terrain;
import com.ssafy.mandarin.domain.village.service.VillageService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/village")
@RequiredArgsConstructor
@Tag(name = "Village", description = "내 마을")
public class VillageController {

	private final VillageService villageService;

	@GetMapping("/sheets/{sheetId}")
	@Operation(
			summary = "내 마을 조회",
			description = "해당 시트에 선택한 지형과 배치 가능한 보유 건물을 3D 모델링 parts 와 함께 반환한다. "
					+ "미보유 건물의 모델링은 응답에 포함되지 않는다."
	)
	public ResponseEntity<ApiResponse<VillageResponse>> getMyVillage(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long sheetId
	) {
		VillageResponse village = villageService.getMyVillage(userDetails.getUserId(), sheetId);
		return ResponseEntity.ok(ApiResponse.success("Village loaded", village));
	}

	@PutMapping("/sheets/{sheetId}/terrain")
	@Operation(
			summary = "마을 지형 변경",
			description = "건물이 놓이는 바닥·길 환경을 시트별로 바꾼다. 횟수 제한 없이 언제든 변경할 수 있다."
	)
	public ResponseEntity<ApiResponse<Terrain>> changeTerrain(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long sheetId,
			@RequestBody @Valid TerrainUpdateRequest request
	) {
		Terrain terrain = villageService.changeTerrain(userDetails.getUserId(), sheetId, request.terrain());
		return ResponseEntity.ok(ApiResponse.success("Terrain changed", terrain));
	}
}
