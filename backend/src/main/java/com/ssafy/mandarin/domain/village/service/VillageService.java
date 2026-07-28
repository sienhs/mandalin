package com.ssafy.mandarin.domain.village.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.service.BuildingInventoryService;
import com.ssafy.mandarin.domain.village.dto.OwnedBuildingResponse;
import com.ssafy.mandarin.domain.village.dto.VillageResponse;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class VillageService {

	private final BuildingInventoryService buildingInventoryService;
	private final ObjectMapper objectMapper;

	/** 마을 화면 한 방 조회 — 배치 가능한(=보유한) 건물 전체. */
	@Transactional
	public VillageResponse getMyVillage(Long userId) {
		List<OwnedBuildingResponse> buildings = buildingInventoryService.findOwnedBuildings(userId).stream()
				.map(this::toResponse)
				.toList();

		return new VillageResponse(buildings);
	}

	private OwnedBuildingResponse toResponse(BuildingItem item) {
		return new OwnedBuildingResponse(
				item.getId(),
				item.getItemKey(),
				item.getName(),
				item.getTheme(),
				item.getType(),
				item.getThumbnailUrl(),
				BuildingSizeResponse.from(item),
				readParts(item)
		);
	}

	/**
	 * parts 를 JSON 배열 그대로 실어 보낸다(문자열로 감싸지 않는다).
	 * jsonb 컬럼이라 항상 유효한 JSON 이며, 깨졌다면 시드가 잘못된 것이다.
	 */
	private JsonNode readParts(BuildingItem item) {
		try {
			return objectMapper.readTree(item.getParts());
		} catch (JacksonException e) {
			throw new BusinessException(ErrorCode.CATALOG_LOAD_FAILED);
		}
	}
}
