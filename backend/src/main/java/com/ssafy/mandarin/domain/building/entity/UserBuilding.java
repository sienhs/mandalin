package com.ssafy.mandarin.domain.building.entity;

import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 유저가 보유한 건물 1건. */
@Entity
@Table(
		name = "user_building",
		uniqueConstraints = @UniqueConstraint(name = "uk_user_building", columnNames = {"user_id", "building_item_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserBuilding extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "building_item_id", nullable = false)
	private BuildingItem buildingItem;

	private UserBuilding(Long userId, BuildingItem buildingItem) {
		this.userId = userId;
		this.buildingItem = buildingItem;
	}

	public static UserBuilding of(Long userId, BuildingItem buildingItem) {
		return new UserBuilding(userId, buildingItem);
	}
}
