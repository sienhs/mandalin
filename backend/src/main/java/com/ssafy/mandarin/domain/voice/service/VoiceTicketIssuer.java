package com.ssafy.mandarin.domain.voice.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

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
 * AI 음성봇(SFU) 입장 티켓 발급.
 *
 * <p>SFU 는 OAuth 도 세션도 모른다. 이 서버가 서명해 준 단기 티켓 하나만 검증한다.
 * 그래서 소셜 제공자가 늘어나도 SFU 는 손댈 곳이 없다.
 *
 * <p><b>클레임 이름과 aud/iss 는 {@code ai/docker-compose.yml} 의 {@code AUTH_*} 설정과
 * 정확히 맞아야 한다.</b> 어긋나면 SFU 는 거절 사유를 구체적으로 알려주지 않으므로
 * (유효한 티켓을 만드는 실마리가 되기 때문), 클라이언트에는 "입장 티켓이 올바르지
 * 않습니다" 만 보이고 원인은 SFU 로그에만 남는다.
 *
 * <p><b>방은 클라이언트가 고르지 않는다.</b> 인증만 붙이고 방 이름을 클라이언트가
 * 정하게 두면 로그인한 아무나 남의 방에 들어간다. 표시 이름도 마찬가지로 티켓에서
 * 간다 — 채팅과 LLM 프롬프트에 들어가는 값이라 사용자가 정하면 안 된다.
 */
@Slf4j
@Component
public class VoiceTicketIssuer {

	/** HS256 최소 키 길이. 이보다 짧으면 JJWT 가 WeakKeyException 을 던진다. */
	private static final int MIN_SECRET_BYTES = 32;

	private static final String CLAIM_ROOM = "room";
	private static final String CLAIM_NAME = "name";

	/** 시크릿이 없거나 쓸 수 없으면 null. 발급만 막고 애플리케이션은 정상 기동한다. */
	private final SecretKey secretKey;
	private final String audience;
	private final String issuer;
	private final String roomPrefix;
	private final Duration ttl;

	public VoiceTicketIssuer(
			@Value("${sfu.ticket-secret:}") String ticketSecret,
			@Value("${jwt.secret}") String accessTokenSecret,
			@Value("${sfu.audience:sfu}") String audience,
			@Value("${sfu.issuer:mandarin}") String issuer,
			@Value("${sfu.room-prefix:u_}") String roomPrefix,
			@Value("${sfu.ticket-expiration:120000}") long ttlMillis
	) {
		this.audience = audience;
		this.issuer = issuer;
		this.roomPrefix = roomPrefix;
		this.ttl = Duration.ofMillis(ttlMillis);
		this.secretKey = buildKey(ticketSecret, accessTokenSecret);
	}

	/**
	 * 티켓을 발급한다.
	 *
	 * @param userId      SFU 가 {@code sub} 로 읽는 사용자 식별자
	 * @param displayName 화면과 프롬프트에 쓰일 이름. SFU 가 32자로 자른다
	 * @throws BusinessException 시크릿이 설정되지 않아 서명할 수 없을 때
	 */
	public VoiceSessionResponse issue(Long userId, String displayName) {
		if (secretKey == null) {
			log.error("SFU_TICKET_SECRET 이 없어 티켓을 발급할 수 없습니다 (userId={})", userId);
			throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
		}

		Instant now = Instant.now();
		Instant expiresAt = now.plus(ttl);
		String roomId = roomPrefix + userId;

		String ticket = Jwts.builder()
				.subject(String.valueOf(userId))
				.claim(CLAIM_NAME, displayName)
				.claim(CLAIM_ROOM, roomId)
				.audience().add(audience).and()
				.issuer(issuer)
				.issuedAt(Date.from(now))
				// SFU 는 exp 를 필수로 요구한다(require=["exp"]).
				.expiration(Date.from(expiresAt))

				.signWith(secretKey, Jwts.SIG.HS256)
				.compact();

		return new VoiceSessionResponse(roomId, ticket, ttl.toSeconds());
	}


	private static SecretKey buildKey(String ticketSecret, String accessTokenSecret) {
		if (!StringUtils.hasText(ticketSecret)) {
			log.warn("SFU_TICKET_SECRET 이 비어 있습니다 — AI 음성 티켓 발급이 비활성화됩니다. "
					+ "나머지 API 는 정상 동작합니다.");
			return null;
		}

		int length = ticketSecret.getBytes(StandardCharsets.UTF_8).length;
		if (length < MIN_SECRET_BYTES) {
			log.warn("SFU_TICKET_SECRET 이 {}바이트로 너무 짧습니다(HS256 은 {}바이트 이상) — "
					+ "AI 음성 티켓 발급이 비활성화됩니다.", length, MIN_SECRET_BYTES);
			return null;
		}

		if (ticketSecret.equals(accessTokenSecret)) {
			// 막지는 않는다. 발급이 멈추면 음성 기능 전체가 죽는데, 위험은 SFU 서버가
			// 침해됐을 때만 현실이 되기 때문이다. 대신 눈에 띄게 남긴다.
			log.warn("SFU_TICKET_SECRET 이 JWT_SECRET 과 같습니다. HS256 은 검증 키 = 서명 키라 "
					+ "SFU 서버가 액세스 토큰까지 위조할 수 있습니다. 다른 값으로 바꾸세요.");
		}

		return Keys.hmacShaKeyFor(ticketSecret.getBytes(StandardCharsets.UTF_8));
	}
}
