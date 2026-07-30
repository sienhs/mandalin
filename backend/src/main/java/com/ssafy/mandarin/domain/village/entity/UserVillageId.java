package com.ssafy.mandarin.domain.village.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/** {@link UserVillage} 복합키 (user_id, sheet_id). */
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class UserVillageId implements Serializable {

	private Long userId;
	private Long sheetId;
}
