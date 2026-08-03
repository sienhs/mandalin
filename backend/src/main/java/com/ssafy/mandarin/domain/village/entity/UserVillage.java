package com.ssafy.mandarin.domain.village.entity;

import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 유저별 시트(마을) 지형 설정. (user_id, sheet_id) 복합 PK. */
@Entity
@Table(name = "user_village")
@IdClass(UserVillageId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserVillage extends BaseEntity {

	@Id
	@Column(name = "user_id")
	private Long userId;

	@Id
	@Column(name = "sheet_id")
	private Long sheetId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Terrain terrain;

	private UserVillage(Long userId, Long sheetId, Terrain terrain) {
		this.userId = userId;
		this.sheetId = sheetId;
		this.terrain = terrain;
	}

	public static UserVillage of(Long userId, Long sheetId, Terrain terrain) {
		return new UserVillage(userId, sheetId, terrain);
	}

	public void changeTerrain(Terrain terrain) {
		this.terrain = terrain;
	}
}
