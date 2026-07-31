package com.ssafy.mandarin.domain.village.entity;

import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 유저별 마을 설정. 지형 하나뿐이라 user_id 를 그대로 PK 로 쓴다. */
@Entity
@Table(name = "user_village")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserVillage extends BaseEntity {

	@Id
	@Column(name = "user_id")
	private Long userId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Terrain terrain;

	private UserVillage(Long userId, Terrain terrain) {
		this.userId = userId;
		this.terrain = terrain;
	}

	public static UserVillage of(Long userId, Terrain terrain) {
		return new UserVillage(userId, terrain);
	}

	public void changeTerrain(Terrain terrain) {
		this.terrain = terrain;
	}
}
