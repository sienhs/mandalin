package com.ssafy.mandarin.domain.auth.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ssafy.mandarin.domain.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	Optional<RefreshToken> findByDeviceId(String deviceId);

	/** 해당 기기 세션만 끊는다(일반 로그아웃). */
	void deleteByDeviceId(String deviceId);

	/** 사용자의 모든 기기 세션을 끊는다(탈퇴, 토큰 재사용 탐지). */
	void deleteByUuid(String uuid);

	/** 만료된 세션 정리. 안 지우면 로그인할 때마다 행이 쌓인다. */
	@Modifying(clearAutomatically = true)
	@Query("delete from RefreshToken rt where rt.expiresAt < :now")
	int deleteExpired(@Param("now") LocalDateTime now);
}
