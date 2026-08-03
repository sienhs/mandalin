package com.ssafy.mandarin.domain.village.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.village.dto.ItemSpotResponse;
import com.ssafy.mandarin.domain.village.dto.ItemSpotUpdateRequest;
import com.ssafy.mandarin.domain.village.dto.TerrainUpdateRequest;
import com.ssafy.mandarin.domain.village.dto.VillageLayoutResponse;
import com.ssafy.mandarin.domain.village.dto.VillageResponse;
import com.ssafy.mandarin.domain.village.entity.Terrain;
import com.ssafy.mandarin.domain.village.service.ItemSpotService;
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
	private final ItemSpotService itemSpotService;

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

	@GetMapping("/sheets/{sheetId}/spots")
	@Operation(
			summary = "마을 배치 조회",
			description = "타일 73칸(중앙 랜드마크 1 + 8구역 × 9칸)에 어떤 건물이 서 있는지 반환한다. "
					+ "각 칸에는 격자 좌표(domainPosition·itemPosition, 1~9)와 만다라트 번호"
					+ "(domainIndex·subjectPosition, 0~7)가 함께 들어 있어 프론트가 좌표를 계산할 필요가 없다. "
					+ "비공개 시트는 소유자만 볼 수 있다."
	)
	public ResponseEntity<ApiResponse<VillageLayoutResponse>> getLayout(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long sheetId
	) {
		VillageLayoutResponse layout = itemSpotService.getLayout(userDetails.getUserId(), sheetId);
		return ResponseEntity.ok(ApiResponse.success("Village layout loaded", layout));
	}

	@PatchMapping("/sheets/{sheetId}/spots/{domainPosition}/{itemPosition}")
	@Operation(
			summary = "타일 한 칸에 건물 배치",
			description = "보유 건물(invenId)을 그 칸에 세운다. invenId 를 null 로 보내면 기본 스킨으로 되돌린다. "
					+ "중앙 구역(domainPosition=5)에는 LANDMARK 만, 나머지 칸에는 NORMAL 만 놓을 수 있다. "
					+ "같은 건물이 다른 칸에 이미 서 있으면 그 칸은 비워진다."
	)
	public ResponseEntity<ApiResponse<ItemSpotResponse>> placeOne(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long sheetId,
			@PathVariable Integer domainPosition,
			@PathVariable Integer itemPosition,
			@RequestBody @Valid ItemSpotUpdateRequest request
	) {
		ItemSpotResponse spot = itemSpotService.placeOne(
				userDetails.getUserId(), sheetId, domainPosition, itemPosition, request);
		return ResponseEntity.ok(ApiResponse.success("Building placed", spot));
	}

	@PutMapping("/sheets/{sheetId}/spots")
	@Operation(
			summary = "마을 배치 일괄 저장",
			description = "여러 칸을 한 번에 바꾼다. 한 칸이라도 규칙을 어기면 전부 되돌린다 — "
					+ "절반만 반영되면 사용자는 무엇이 저장됐는지 알 수 없다."
	)
	public ResponseEntity<ApiResponse<VillageLayoutResponse>> placeMany(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long sheetId,
			@RequestBody @Valid ItemSpotUpdateRequest.Bulk request
	) {
		VillageLayoutResponse layout = itemSpotService.placeMany(
				userDetails.getUserId(), sheetId, request);
		return ResponseEntity.ok(ApiResponse.success("Village layout saved", layout));
	}
}
