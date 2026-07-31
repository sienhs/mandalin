package com.ssafy.mandarin.domain.voice.service;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Date;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.ssafy.mandarin.domain.voice.dto.VoiceSessionResponse;
import com.ssafy.mandarin.global.exception.BusinessException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * 티켓의 클레임은 AI 서버({@code ai/app/auth/ticket.py})가 읽는 이름과 정확히 맞아야 한다.
 * 어긋나도 양쪽 다 정상 기동하고 사용자만 입장에서 튕기므로, 여기서 고정해 둔다.
 */
class VoiceTicketIssuerTest {

	/** 32바이트. HS256 최소 길이를 갓 넘긴 값. */
	private static final String TICKET_SECRET = "0123456789abcdef0123456789abcdef";
	private static final String ACCESS_TOKEN_SECRET = "fedcba9876543210fedcba9876543210";

	private static final String AUDIENCE = "sfu";
	private static final String ISSUER = "mandarin";
	private static final String ROOM_PREFIX = "u_";
	private static final long TTL_MILLIS = 120_000L;

	private VoiceTicketIssuer issuerWith(String ticketSecret) {
		return new VoiceTicketIssuer(
				ticketSecret, ACCESS_TOKEN_SECRET, AUDIENCE, ISSUER, ROOM_PREFIX, TTL_MILLIS);
	}

	private Claims parse(String ticket) {
		return Jwts.parser()
				.verifyWith(Keys.hmacShaKeyFor(TICKET_SECRET.getBytes(UTF_8)))
				.build()
				.parseSignedClaims(ticket)
				.getPayload();
	}

	@Test
	@DisplayName("서명 알고리즘은 항상 HS256 이다 — 키가 길어도 HS512 로 올라가지 않는다")
	void alwaysSignsWithHs256() {
		// 인자 없는 signWith(key) 는 키 길이에 맞는 가장 강한 HMAC 을 고른다.
		// 64바이트 시크릿(= openssl rand -hex 32)이면 HS512 가 되는데, SFU 는
		// ["HS256"] 만 허용하므로 티켓이 통째로 거절된다. 그 거절은 AUTH_INVALID
		// 하나로만 나와서 원인을 찾기 어렵다 — 그래서 여기서 고정한다.
		String sixtyFourByteSecret = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
		assertThat(sixtyFourByteSecret.getBytes(UTF_8)).hasSize(64);

		VoiceTicketIssuer issuer = new VoiceTicketIssuer(
				sixtyFourByteSecret, ACCESS_TOKEN_SECRET, AUDIENCE, ISSUER, ROOM_PREFIX, TTL_MILLIS);

		String algorithm = Jwts.parser()
				.verifyWith(Keys.hmacShaKeyFor(sixtyFourByteSecret.getBytes(UTF_8)))
				.build()
				.parseSignedClaims(issuer.issue(1L, "지우").ticket())
				.getHeader()
				.getAlgorithm();

		assertThat(algorithm).isEqualTo("HS256");
	}

	@Test
	@DisplayName("발급된 티켓의 클레임이 SFU 검증 규칙과 맞는다")
	void issuesTicketMatchingSfuContract() {
		VoiceSessionResponse response = issuerWith(TICKET_SECRET).issue(42L, "지우");

		assertThat(response.roomId()).isEqualTo("u_42");
		assertThat(response.expiresInSeconds()).isEqualTo(120);

		Claims claims = parse(response.ticket());

		// SFU 는 auth_claim_user_id 기본값이 sub 다. PyJWT 2.10+ 의 타입 검사를 피하려고
		// 숫자 PK 를 문자열로 넣는다.
		assertThat(claims.getSubject()).isEqualTo("42");
		assertThat(claims.get("room", String.class)).isEqualTo("u_42");
		assertThat(claims.get("name", String.class)).isEqualTo("지우");

		// aud/iss 를 설정하면 SFU 는 반드시 있어야 한다고 본다(verify_aud/verify_iss).
		assertThat(claims.getAudience()).containsExactly(AUDIENCE);
		assertThat(claims.getIssuer()).isEqualTo(ISSUER);

		// options={"require": ["exp"]} — exp 가 없으면 서명이 맞아도 거절된다.
		assertThat(claims.getExpiration()).isNotNull();
	}

	@Test
	@DisplayName("티켓 수명이 설정한 TTL 과 일치한다")
	void honoursConfiguredTtl() {
		VoiceSessionResponse response = issuerWith(TICKET_SECRET).issue(7L, "테스터");
		Claims claims = parse(response.ticket());

		Date issuedAt = claims.getIssuedAt();
		Date expiration = claims.getExpiration();

		assertThat(expiration.getTime() - issuedAt.getTime()).isEqualTo(TTL_MILLIS);
	}

	@Test
	@DisplayName("room 클레임은 사용자마다 갈린다 — 남의 방에 들어갈 수 없다")
	void derivesRoomPerUser() {
		VoiceTicketIssuer issuer = issuerWith(TICKET_SECRET);

		assertThat(issuer.issue(1L, "가").roomId()).isEqualTo("u_1");
		assertThat(issuer.issue(2L, "나").roomId()).isEqualTo("u_2");
	}

	@Test
	@DisplayName("시크릿이 비어 있으면 기동은 되지만 발급만 실패한다")
	void disablesIssuingWhenSecretMissing() {
		// 생성자가 예외를 던지면 컨텍스트가 통째로 죽어 로그인까지 못 하게 된다.
		VoiceTicketIssuer issuer = issuerWith("");

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	@DisplayName("시크릿이 32바이트보다 짧으면 발급하지 않는다")
	void disablesIssuingWhenSecretTooShort() {
		VoiceTicketIssuer issuer = issuerWith("too-short");

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}
}
