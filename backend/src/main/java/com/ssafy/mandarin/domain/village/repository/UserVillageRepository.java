package com.ssafy.mandarin.domain.village.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.village.entity.UserVillage;
import com.ssafy.mandarin.domain.village.entity.UserVillageId;

public interface UserVillageRepository extends JpaRepository<UserVillage, UserVillageId> {

	/** 지형은 시트마다 따로 고른다 — userId 만으로 조회하면 시트가 여러 개인 유저에서 행이 여러 개 잡힌다. */
	Optional<UserVillage> findByUserIdAndSheetId(Long userId, Long sheetId);
}
