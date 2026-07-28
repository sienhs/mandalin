package com.ssafy.mandarin.domain.village.entity;

/**
 * 마을 지형 — 건물이 놓이는 바닥·길·치장.
 *
 * <p>프론트의 {@code src/village/terrain} 렌더러와 이름이 1:1로 대응한다.
 * 값을 추가하려면 {@code user_village} 의 CHECK 제약도 함께 늘려야 한다.
 */
public enum Terrain {

	/** 포장도로를 깐 도시 — 아스팔트, 차선, 인도, 횡단보도. */
	CITY_ROAD,

	/** 거친 비포장 도로 — 마른 흙, 바퀴자국, 자갈. */
	DIRT_ROAD,

	/** 푸른 초원의 다져진 길 — 잔디, 흙길, 야생화. */
	GRASS_PATH,

	/** 물 길 — 수로와 섬, 목재 다리. */
	WATER_WAY;

	/** 아직 고르지 않은 유저에게 적용할 지형. */
	public static final Terrain DEFAULT = GRASS_PATH;
}
