package com.ssafy.mandarin.domain.building.service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * {@code classpath:catalog/buildings.json} → {@code building_item} 동기화.
 *
 * <p>모델링 원본은 프론트의 TS 카탈로그이고, {@code npm run export:catalog} 로 뽑은 JSON 을
 * 여기서 upsert 한다. 건물이 256종이라 Flyway INSERT 로는 관리가 안 되고, 건물을 하나 고칠
 * 때마다 마이그레이션을 새로 쓰게 하고 싶지도 않아서 기동 시 동기화로 처리한다.
 *
 * <p>기존 행은 item_key 로 매칭해 변경분만 갱신하므로 유저 인벤토리(FK)가 끊기지 않는다.
 * 카탈로그에서 사라진 건물은 이미 보유한 유저가 있을 수 있어 삭제하지 않는다.
 *
 * <p>JSON 을 못 읽으면 기동을 실패시킨다 — 카탈로그가 비면 마을이 아예 그려지지 않으므로
 * 조용히 넘어가는 쪽이 더 위험하다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BuildingCatalogSeeder implements ApplicationRunner {

	private static final String CATALOG_PATH = "catalog/buildings.json";

	private final BuildingItemRepository buildingItemRepository;
	private final ObjectMapper objectMapper;

	@Value("${app.catalog.seed-on-startup:true}")
	private boolean seedOnStartup;

	@Override
	@Transactional
	public void run(ApplicationArguments args) throws IOException {
		if (!seedOnStartup) {
			log.info("Building catalog seeding disabled (app.catalog.seed-on-startup=false)");
			return;
		}

		List<BuildingItem> parsed = readCatalog();
		Map<String, BuildingItem> existing = buildingItemRepository.findAll().stream()
				.collect(Collectors.toMap(BuildingItem::getItemKey, Function.identity()));

		List<BuildingItem> inserts = new ArrayList<>();
		int updated = 0;

		for (BuildingItem item : parsed) {
			BuildingItem current = existing.get(item.getItemKey());
			if (current == null) {
				inserts.add(item);
			} else if (current.syncFrom(item, samePartsJson(current.getParts(), item.getParts()))) {
				updated++;
			}
		}
		buildingItemRepository.saveAll(inserts);

		log.info("Building catalog synced: {} total ({} inserted, {} updated)",
				parsed.size(), inserts.size(), updated);
	}

	/**
	 * parts 가 내용상 같은지.
	 *
	 * <p>DB 에서 읽어온 값은 Postgres 가 jsonb 로 저장하며 키 순서를 재정렬한 것이라, 시드
	 * 원본과 내용이 같아도 문자열은 다르다. 문자열로 비교하면 매 기동마다 256행을 통째로
	 * 다시 쓰게 되므로 파싱해서 트리끼리 비교한다(JsonNode 동등성은 키 순서를 따지지 않는다).
	 */
	private boolean samePartsJson(String stored, String incoming) {
		try {
			return objectMapper.readTree(stored).equals(objectMapper.readTree(incoming));
		} catch (JacksonException e) {
			// 저장된 값이 깨졌다면 다시 쓰는 게 맞다.
			log.warn("Stored parts JSON is unreadable, will overwrite: {}", e.getMessage());
			return false;
		}
	}

	private List<BuildingItem> readCatalog() throws IOException {
		ClassPathResource resource = new ClassPathResource(CATALOG_PATH);
		if (!resource.exists()) {
			throw new IllegalStateException(CATALOG_PATH + " not found — run `npm run export:catalog` in frontend/");
		}

		try (InputStream in = resource.getInputStream()) {
			JsonNode items = objectMapper.readTree(in).path("items");

			List<BuildingItem> result = new ArrayList<>(items.size());
			Set<String> seen = new HashSet<>();
			for (JsonNode node : items) {
				BuildingItem item = toEntity(node);
				// item_key 는 UNIQUE 라 중복이 있으면 insert 에서 터진다. 원인이 드러나게 먼저 잡는다.
				if (!seen.add(item.getItemKey())) {
					throw new IllegalStateException("Duplicate itemKey in catalog: " + item.getItemKey());
				}
				result.add(item);
			}
			return result;
		}
	}

	private BuildingItem toEntity(JsonNode node) {
		JsonNode size = node.path("size");
		return BuildingItem.builder()
				.itemKey(node.path("itemKey").asString())
				.name(node.path("name").asString())
				.theme(node.path("theme").asString())
				.type(BuildingType.valueOf(node.path("type").asString()))
				.price(node.path("price").asInt())
				.defaultGranted(node.path("defaultGranted").asBoolean())
				.sizeWidth(BigDecimal.valueOf(size.path("width").asDouble()))
				.sizeDepth(BigDecimal.valueOf(size.path("depth").asDouble()))
				.sizeHeight(BigDecimal.valueOf(size.path("height").asDouble()))
				.parts(node.path("parts").toString())
				.sortOrder(node.path("sortOrder").asInt())
				.build();
	}
}
