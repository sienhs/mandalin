package com.ssafy.mandarin.domain.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	Optional<RefreshToken> findByEmail(String email);
	Optional<RefreshToken> findByToken(String token);

	void deleteByEmail(String email);
}
