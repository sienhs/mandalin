package com.ssafy.mandarin.domain.shop.dto;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 상점 진열용 건물 1종.
 *
 * <p>3D 모델링 데이터({@code parts})는 일부러 뺐다. 건물 1종의 parts 는 부품 수십~수백 개
 * 배열이라 카탈로그 전체(수백 종)에 실으면 응답이 수 MB 가 된다. 목록에서는 썸네일로 보여주고,
 * parts 가 필요하면 상세 조회를 부른다.
 */
@Schema(description = "상점 건물 (목록용 — 모델링 데이터 제외)")
public record ShopBuildingResponse(
		@Schema(example = "12") Long itemId,
		@Schema(example = "medieval_clocktower") String itemKey,
		@Schema(example = "시계탑") String name,
		@Schema(example = "MEDIEVAL") String theme,
		@Schema(example = "LANDMARK") BuildingType type,
		@Schema(description = "판매 가격(포인트)", example = "500") int price,
		@Schema(description = "이미 보유한 건물인지. true 면 구매할 수 없다", example = "false") boolean owned,
		@Schema(description = "썸네일. 아직 굽지 않았으면 null", nullable = true) String thumbnailUrl,
		BuildingSizeResponse size
) {

	public static ShopBuildingResponse of(BuildingItem item, boolean owned) {
		return new ShopBuildingResponse(
				item.getId(),
				item.getItemKey(),
				item.getName(),
				item.getTheme(),
				item.getType(),
				item.getPrice(),
				owned,
				item.getThumbnailUrl(),
				BuildingSizeResponse.from(item));
	}
}
