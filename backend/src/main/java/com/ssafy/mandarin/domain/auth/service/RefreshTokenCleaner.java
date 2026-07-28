package com.ssafy.mandarin.domain.auth.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 만료된 리프레시 토큰 정리.
 *
 * <p>기기당 한 행이 되면서 로그인할 때마다 행이 늘어난다. 로그아웃 없이 브라우저만 닫으면
 * 그 행은 만료일까지 남으므로 주기적으로 걷어낸다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleaner {

	private final RefreshTokenRepository refreshTokenRepository;

	/** 매일 새벽 4시. */
	@Scheduled(cron = "0 0 4 * * *")
	@Transactional
	public void purgeExpired() {
		int deleted = refreshTokenRepository.deleteExpired(LocalDateTime.now());
		if (deleted > 0) {
			log.info("Purged {} expired refresh tokens", deleted);
		}
	}
}
