package com.ssafy.mandarin.domain.shop.dto;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 구매 결과.
 *
 * <p>차감 후 잔액을 함께 내려준다. 프론트가 구매 직후 프로필을 다시 조회하지 않아도 되고,
 * 무엇보다 "화면의 잔액"과 "서버의 잔액"이 어긋나지 않는다.
 */
@Schema(description = "건물 구매 결과")
public record BuildingPurchaseResponse(
		@Schema(example = "12") Long itemId,
		@Schema(example = "medieval_clocktower") String itemKey,
		@Schema(description = "실제 차감된 포인트", example = "500") int paidPoint,
		@Schema(description = "차감 후 잔액", example = "750") int remainingPoint
) {

	public static BuildingPurchaseResponse of(BuildingItem item, int remainingPoint) {
		return new BuildingPurchaseResponse(item.getId(), item.getItemKey(), item.getPrice(), remainingPoint);
	}
}
