package com.ssafy.mandarin.domain.village.dto;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingType;

import io.swagger.v3.oas.annotations.media.Schema;
import tools.jackson.databind.JsonNode;

/**
 * 마을에 배치할 수 있는 보유 건물 1종.
 *
 * <p>{@code parts} 가 3D 모델링 데이터 본체다. 프론트는 이 배열만으로 건물을 그리며,
 * 서버가 보유분만 내려주므로 미보유 건물의 모델링은 클라이언트에 존재하지 않는다.
 */
@Schema(description = "보유 건물 (모델링 데이터 포함)")
public record OwnedBuildingResponse(
		@Schema(example = "12") Long itemId,
		@Schema(example = "medieval_clocktower") String itemKey,
		@Schema(example = "시계탑") String name,
		@Schema(example = "MEDIEVAL") String theme,
		@Schema(example = "LANDMARK") BuildingType type,
		@Schema(description = "썸네일. 아직 굽지 않았으면 null", nullable = true) String thumbnailUrl,
		BuildingSizeResponse size,
		@Schema(description = "3D 부품 배열 — 렌더러가 그대로 해석한다") JsonNode parts
) {
}
