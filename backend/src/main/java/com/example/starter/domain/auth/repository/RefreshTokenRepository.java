package com.example.starter.domain.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.starter.domain.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	Optional<RefreshToken> findByEmail(String email);
	Optional<RefreshToken> findByToken(String token);

	void deleteByEmail(String email);
}
