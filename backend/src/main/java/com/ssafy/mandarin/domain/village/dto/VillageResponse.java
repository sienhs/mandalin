package com.ssafy.mandarin.domain.village.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * /village 최초 로드에 필요한 것 묶음.
 *
 * <p>지금은 배치 가능한 건물뿐이고, 지형을 붙일 때 필드가 하나 늘어난다.
 * 마을 화면이 요청 한 번으로 뜨게 하려고 한 덩어리로 둔다.
 */
@Schema(description = "내 마을 정보")
public record VillageResponse(
		List<OwnedBuildingResponse> buildings
) {
}
