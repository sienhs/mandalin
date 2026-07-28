package com.ssafy.mandarin.domain.building.entity;

import java.math.BigDecimal;
import java.util.Objects;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 건물 카탈로그 1종.
 *
 * <p>{@code parts} 는 3D 모델링 부품 배열(JSON) 원본이다. 서버는 이 JSON 을 해석하지 않고
 * 통째로 보관·전달만 한다 — 렌더링 규칙은 프론트 렌더러의 몫이고, 서버가 쥐어야 하는 건
 * "누가 무엇을 보유했는가" 뿐이다.
 */
@Entity
@Table(name = "building_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class BuildingItem extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** 프론트 카탈로그 key (예: {@code medieval_clocktower}). 시드 upsert 기준. */
	@Column(nullable = false, unique = true, length = 80)
	private String itemKey;

	@Column(nullable = false, length = 120)
	private String name;

	/** {@code BASIC} 또는 프리미엄 테마 id 대문자 (예: {@code MEDIEVAL}). */
	@Column(nullable = false, length = 30)
	private String theme;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private BuildingType type;

	@Column(nullable = false)
	private int price;

	/** 가입 시 자동 지급 대상(기본 제공 건물). */
	@Column(nullable = false)
	private boolean defaultGranted;

	@Column(nullable = false, precision = 6, scale = 3)
	private BigDecimal sizeWidth;

	@Column(nullable = false, precision = 6, scale = 3)
	private BigDecimal sizeDepth;

	@Column(nullable = false, precision = 6, scale = 3)
	private BigDecimal sizeHeight;

	/** 저장소에 올린 3D 스크린샷 썸네일. 아직 안 구웠으면 null. */
	@Column(columnDefinition = "text")
	private String thumbnailUrl;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = false, columnDefinition = "jsonb")
	private String parts;

	@Column(nullable = false)
	private int sortOrder;

	/**
	 * 시드 재적재 시 변경분만 반영한다.
	 *
	 * @return 실제로 바뀐 값이 있으면 true
	 */
	public boolean syncFrom(BuildingItem source) {
		if (!isChangedFrom(source)) {
			return false;
		}
		this.name = source.name;
		this.theme = source.theme;
		this.type = source.type;
		this.price = source.price;
		this.defaultGranted = source.defaultGranted;
		this.sizeWidth = source.sizeWidth;
		this.sizeDepth = source.sizeDepth;
		this.sizeHeight = source.sizeHeight;
		this.parts = source.parts;
		this.sortOrder = source.sortOrder;
		return true;
	}

	/** 썸네일은 시드가 아니라 업로드로 채워지므로 비교 대상에서 뺀다. */
	private boolean isChangedFrom(BuildingItem source) {
		return !Objects.equals(name, source.name)
				|| !Objects.equals(theme, source.theme)
				|| type != source.type
				|| price != source.price
				|| defaultGranted != source.defaultGranted
				|| sizeWidth.compareTo(source.sizeWidth) != 0
				|| sizeDepth.compareTo(source.sizeDepth) != 0
				|| sizeHeight.compareTo(source.sizeHeight) != 0
				|| !Objects.equals(parts, source.parts)
				|| sortOrder != source.sortOrder;
	}
}
