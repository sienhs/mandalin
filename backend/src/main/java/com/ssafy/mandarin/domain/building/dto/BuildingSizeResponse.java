package com.ssafy.mandarin.domain.building.dto;

import java.math.BigDecimal;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;

import io.swagger.v3.oas.annotations.media.Schema;

/** 건물 크기(ref 단위 — 마을 한 칸이 약 1.0). parts 바운딩 박스에서 시드 시 계산된 값. */
@Schema(description = "건물 크기 (ref 단위)")
public record BuildingSizeResponse(
		@Schema(example = "0.464") BigDecimal width,
		@Schema(example = "0.464") BigDecimal depth,
		@Schema(example = "1.110") BigDecimal height
) {

	public static BuildingSizeResponse from(BuildingItem item) {
		return new BuildingSizeResponse(item.getSizeWidth(), item.getSizeDepth(), item.getSizeHeight());
	}
}
