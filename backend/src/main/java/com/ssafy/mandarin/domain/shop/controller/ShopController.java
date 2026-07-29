package com.ssafy.mandarin.domain.shop.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.shop.dto.BuildingPurchaseResponse;
import com.ssafy.mandarin.domain.shop.dto.ShopBuildingDetailResponse;
import com.ssafy.mandarin.domain.shop.dto.ShopBuildingResponse;
import com.ssafy.mandarin.domain.shop.service.ShopService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/shop")
@RequiredArgsConstructor
@Tag(name = "Shop", description = "건물 상점")
public class ShopController {

	private final ShopService shopService;

	@GetMapping("/buildings")
	@Operation(
			summary = "상점 건물 목록",
			description = "판매 중인 건물 전체를 진열 순서(sortOrder)대로 반환한다. 각 건물에 보유 여부(owned)가 붙는다. "
					+ "응답 크기 때문에 3D 모델링 데이터(parts)는 빠져 있으니 미리보기는 썸네일을 쓰고, "
					+ "모델링이 필요하면 상세 조회를 부른다."
	)
	public ResponseEntity<ApiResponse<List<ShopBuildingResponse>>> getBuildings(
			@AuthenticationPrincipal CustomUserDetails userDetails
	) {
		List<ShopBuildingResponse> buildings = shopService.findAll(userDetails.getUserId());
		return ResponseEntity.ok(ApiResponse.success("Shop buildings loaded", buildings));
	}

	@GetMapping("/buildings/{itemId}")
	@Operation(
			summary = "상점 건물 상세",
			description = "목록에서 뺀 3D 모델링 데이터(parts)를 포함해 반환한다. 미보유 건물도 조회할 수 있다."
	)
	public ResponseEntity<ApiResponse<ShopBuildingDetailResponse>> getBuilding(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long itemId
	) {
		ShopBuildingDetailResponse building = shopService.findOne(userDetails.getUserId(), itemId);
		return ResponseEntity.ok(ApiResponse.success("Shop building loaded", building));
	}

	@PostMapping("/buildings/{itemId}/purchase")
	@Operation(
			summary = "건물 구매",
			description = "포인트를 차감하고 보유 건물에 등록한다. 차감 후 잔액을 함께 반환한다. "
					+ "이미 보유한 건물이면 409, 포인트가 부족하면 400 이다."
	)
	public ResponseEntity<ApiResponse<BuildingPurchaseResponse>> purchase(
			@AuthenticationPrincipal CustomUserDetails userDetails,
			@PathVariable Long itemId
	) {
		BuildingPurchaseResponse purchased = shopService.purchase(userDetails.getUserId(), itemId);
		return ResponseEntity.ok(ApiResponse.success("Building purchased", purchased));
	}
}
