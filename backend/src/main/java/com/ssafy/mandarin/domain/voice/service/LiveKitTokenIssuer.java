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
				.claim(CLAIM_VIDEO, Map.of(GRANT_ROOM, roomId, GRANT_ROOM_JOIN, true))
				.issuer(apiKey)
				.issuedAt(Date.from(now))
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
			log.warn("LIVEKIT_API_SECRET 이 {}바이트로 너무 짧습니다(HS256 은 {}바이트 이상) — "
					+ "AI 음성 토큰 발급이 비활성화됩니다.", length, MIN_SECRET_BYTES);
			return null;
		}

		if (apiSecret.equals(accessTokenSecret)) {
			log.warn("LIVEKIT_API_SECRET 이 JWT_SECRET 과 같습니다. HS256 은 검증 키 = 서명 키라 "
					+ "LiveKit 서버가 액세스 토큰까지 위조할 수 있습니다. 다른 값으로 바꾸세요.");
		}

		return Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));
	}
}
