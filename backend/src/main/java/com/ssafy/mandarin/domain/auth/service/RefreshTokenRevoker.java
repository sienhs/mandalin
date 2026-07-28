package com.ssafy.mandarin.domain.auth.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 리프레시 토큰 강제 폐기 — <b>독립 트랜잭션</b>.
 *
 * <p>토큰 재사용을 탐지하면 세션을 지우고 곧바로 401 을 던져야 한다. 그런데 호출한
 * 트랜잭션 안에서 지우면 예외로 롤백되면서 삭제가 되살아난다(= 탈취된 토큰의 형제 세션이
 * 그대로 살아 있다). 그래서 별도 트랜잭션에서 커밋한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenRevoker {

	private final RefreshTokenRepository refreshTokenRepository;

	/** 해당 사용자의 모든 기기 세션을 끊는다. 호출자의 롤백에 영향받지 않는다. */
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void revokeAllSessions(String uuid) {
		refreshTokenRepository.deleteByUuid(uuid);
		log.warn("All refresh sessions revoked: uuid={}", uuid);
	}
}
