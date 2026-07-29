package com.ssafy.mandarin.domain.shop.dto;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;

import io.swagger.v3.oas.annotations.media.Schema;
import tools.jackson.databind.JsonNode;

/**
 * 상점 건물 상세.
 *
 * <p>목록({@link ShopBuildingResponse})과 같은 필드에 {@code parts} 만 더한다. 미보유 건물도
 * parts 를 내려주는데, 상점은 "사기 전에 보는 곳"이라 미리보기를 막으면 상세 조회의 의미가 없다.
 * 모델링 데이터가 유출되면 곤란한 게 아니라 배치 권한이 {@code user_building} 으로 통제된다.
 */
@Schema(description = "상점 건물 상세 (모델링 데이터 포함)")
public record ShopBuildingDetailResponse(
		@Schema(example = "12") Long itemId,
		@Schema(example = "medieval_clocktower") String itemKey,
		@Schema(example = "시계탑") String name,
		@Schema(example = "MEDIEVAL") String theme,
		@Schema(example = "LANDMARK") BuildingType type,
		@Schema(description = "판매 가격(포인트)", example = "500") int price,
		@Schema(description = "이미 보유한 건물인지", example = "false") boolean owned,
		@Schema(description = "썸네일. 아직 굽지 않았으면 null", nullable = true) String thumbnailUrl,
		BuildingSizeResponse size,
		@Schema(description = "3D 부품 배열 — 렌더러가 그대로 해석한다") JsonNode parts
) {

	public static ShopBuildingDetailResponse of(BuildingItem item, boolean owned, JsonNode parts) {
		return new ShopBuildingDetailResponse(
				item.getId(),
				item.getItemKey(),
				item.getName(),
				item.getTheme(),
				item.getType(),
				item.getPrice(),
				owned,
				item.getThumbnailUrl(),
				BuildingSizeResponse.from(item),
				parts);
	}
}
