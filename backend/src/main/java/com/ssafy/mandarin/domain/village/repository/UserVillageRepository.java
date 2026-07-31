package com.ssafy.mandarin.domain.village.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.village.entity.UserVillage;

public interface UserVillageRepository extends JpaRepository<UserVillage, Long> {

	Optional<UserVillage> findByUserId(Long userId);
}
