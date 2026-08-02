package com.ssafy.mandarin.domain.voice.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.ssafy.mandarin.domain.voice.dto.VoiceSessionResponse;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * AI 음성 코칭(LiveKit) 입장 토큰 발급.
 */
@Slf4j
@Component
public class LiveKitTokenIssuer {

	/** HS256 최소 키 길이. 이보다 짧으면 JJWT 가 WeakKeyException 을 던진다. */
	private static final int MIN_SECRET_BYTES = 32;

	private static final String CLAIM_VIDEO = "video";
	private static final String CLAIM_NAME = "name";

	/** LiveKit VideoGrant 의 키. 오타가 나면 grant 가 빈 채로 서명된다. */
	private static final String GRANT_ROOM = "room";
	private static final String GRANT_ROOM_JOIN = "roomJoin";

	private final SecretKey secretKey;
	/** LiveKit API key. {@code iss} 로 들어간다. 비어 있으면 발급하지 않는다. */
	private final String apiKey;
	/** 클라이언트가 붙을 LiveKit 주소. 응답에 그대로 실린다. */
	private final String url;
	private final String roomPrefix;
	private final Duration ttl;

	public LiveKitTokenIssuer(
			@Value("${livekit.api-key:}") String apiKey,
			@Value("${livekit.api-secret:}") String apiSecret,
			@Value("${livekit.url:}") String url,
			@Value("${jwt.secret}") String accessTokenSecret,
			@Value("${livekit.room-prefix:u_}") String roomPrefix,
			@Value("${livekit.token-expiration:120000}") long ttlMillis
	) {
		this.apiKey = apiKey;
		this.url = url;
		this.roomPrefix = roomPrefix;
		this.ttl = Duration.ofMillis(ttlMillis);
		this.secretKey = buildKey(apiSecret, accessTokenSecret);

		// 기동은 막지 않는다. 발급이 멈추면 음성 기능만 죽지만, 여기서 예외를 던지면
		// 로그인까지 못 하게 된다. 대신 원인을 남긴다 — 안 그러면 증상이 "브라우저만
		// 연결 실패" 로 나타나서 설정이 원인이라는 것을 알기 어렵다.
		if (!StringUtils.hasText(apiKey)) {
			log.warn("LIVEKIT_API_KEY 가 비어 있습니다 — AI 음성 토큰 발급이 비활성화됩니다. "
					+ "LiveKit 서버의 livekit.yaml 에 있는 API key 를 넣으세요.");
		}
		if (!StringUtils.hasText(url)) {
			log.warn("LIVEKIT_URL 이 비어 있습니다 — AI 음성 토큰 발급이 비활성화됩니다.");
		}
	}

	/**
	 * 토큰을 발급한다.
	 *
	 * @param userId      LiveKit 이 참가자 identity({@code sub})로 쓰는 사용자 식별자
	 * @param displayName 화면과 프롬프트에 쓰일 이름. LiveKit 의 참가자 이름이 된다
	 * @throws BusinessException 키·시크릿·주소가 없어 발급할 수 없을 때
	 */
	public VoiceSessionResponse issue(Long userId, String displayName) {
		if (secretKey == null || !StringUtils.hasText(apiKey) || !StringUtils.hasText(url)) {
			log.error("LiveKit 설정이 없어 토큰을 발급할 수 없습니다 (userId={})", userId);
			throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
		}

		Instant now = Instant.now();
		Instant expiresAt = now.plus(ttl);
		String roomId = roomPrefix + userId;

		String token = Jwts.builder()
				.subject(String.valueOf(userId))
				.claim(CLAIM_NAME, displayName)
				// LiveKit 은 권한을 video 클레임 안에서 읽는다. 평면 room 클레임은
				// 무시되므로, 서명이 맞아도 입장 권한이 없는 토큰이 된다.
				.claim(CLAIM_VIDEO, Map.of(GRANT_ROOM, roomId, GRANT_ROOM_JOIN, true))
				// aud 는 넣지 않는다. LiveKit 은 audience 를 검증하지 않는다.
				.issuer(apiKey)
				.issuedAt(Date.from(now))
				// 수명 2분. 화면 진입 시가 아니라 연결 직전에 발급받아야 한다.
				.expiration(Date.from(expiresAt))
				.signWith(secretKey, Jwts.SIG.HS256)
				.compact();

		return new VoiceSessionResponse(roomId, url, token, ttl.toSeconds());
	}


	private static SecretKey buildKey(String apiSecret, String accessTokenSecret) {
		if (!StringUtils.hasText(apiSecret)) {
			log.warn("LIVEKIT_API_SECRET 이 비어 있습니다 — AI 음성 토큰 발급이 비활성화됩니다. "
					+ "나머지 API 는 정상 동작합니다.");
			return null;
		}

		int length = apiSecret.getBytes(StandardCharsets.UTF_8).length;
		if (length < MIN_SECRET_BYTES) {
			// LiveKit 을 `--dev` 로 띄우면 시크릿이 `secret`(6바이트)으로 고정되는데,
			// 그 값으로는 여기서 서명할 수 없다. 로컬에서도 livekit.yaml 로 32바이트
			// 이상 키쌍을 주고 띄워야 한다.
			log.warn("LIVEKIT_API_SECRET 이 {}바이트로 너무 짧습니다(HS256 은 {}바이트 이상) — "
					+ "AI 음성 토큰 발급이 비활성화됩니다.", length, MIN_SECRET_BYTES);
			return null;
		}

		if (apiSecret.equals(accessTokenSecret)) {
			// 막지는 않는다. 발급이 멈추면 음성 기능 전체가 죽는데, 위험은 LiveKit
			// 서버가 침해됐을 때만 현실이 되기 때문이다. 대신 눈에 띄게 남긴다.
			log.warn("LIVEKIT_API_SECRET 이 JWT_SECRET 과 같습니다. HS256 은 검증 키 = 서명 키라 "
					+ "LiveKit 서버가 액세스 토큰까지 위조할 수 있습니다. 다른 값으로 바꾸세요.");
		}

		return Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));
	}
}
