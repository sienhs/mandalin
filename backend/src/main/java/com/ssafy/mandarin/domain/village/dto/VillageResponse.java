package com.ssafy.mandarin.domain.village.dto;

import java.util.List;

import com.ssafy.mandarin.domain.village.entity.Terrain;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * /village 최초 로드에 필요한 것 묶음.
 * 마을 화면이 요청 한 번으로 뜨게 하려고 지형과 건물을 한 덩어리로 둔다.
 */
@Schema(description = "내 마을 정보")
public record VillageResponse(
		@Schema(description = "선택한 지형. 고른 적 없으면 기본값이 내려간다", example = "GRASS_PATH")
		Terrain terrain,
		List<OwnedBuildingResponse> buildings
) {
}
