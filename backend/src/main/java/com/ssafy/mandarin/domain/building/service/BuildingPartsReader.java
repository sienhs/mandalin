package com.ssafy.mandarin.domain.building.service;

import org.springframework.stereotype.Component;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * {@code building_item.parts} 를 JSON 배열 그대로 꺼낸다.
 *
 * <p>마을 조회와 상점 상세가 같은 변환을 필요로 해서 한곳에 모았다. 문자열로 감싸 보내면
 * 프론트가 한 번 더 파싱해야 하므로 {@link JsonNode} 로 실어 보낸다.
 */
@Component
@RequiredArgsConstructor
public class BuildingPartsReader {

	private final ObjectMapper objectMapper;

	/**
	 * jsonb 컬럼이라 항상 유효한 JSON 이다. 깨졌다면 시드가 잘못된 것이라 500 으로 올린다 —
	 * 클라이언트가 고칠 수 있는 문제가 아니다.
	 */
	public JsonNode read(BuildingItem item) {
		try {
			return objectMapper.readTree(item.getParts());
		} catch (JacksonException e) {
			throw new BusinessException(ErrorCode.CATALOG_LOAD_FAILED);
		}
	}
}
