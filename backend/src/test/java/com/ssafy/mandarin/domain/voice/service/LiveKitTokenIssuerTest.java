package com.ssafy.mandarin.domain.voice.service;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Date;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.ssafy.mandarin.domain.voice.dto.VoiceSessionResponse;
import com.ssafy.mandarin.global.exception.BusinessException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * 토큰의 클레임은 LiveKit 서버가 읽는 이름과 정확히 맞아야 한다. 어긋나도 양쪽 다 정상
 * 기동하고 사용자만 입장에서 튕기므로, 여기서 고정해 둔다.
 */
class LiveKitTokenIssuerTest {

	/** 32바이트. HS256 최소 길이를 갓 넘긴 값. */
	private static final String API_SECRET = "0123456789abcdef0123456789abcdef"; // NOSONAR
	private static final String ACCESS_TOKEN_SECRET = "fedcba9876543210fedcba9876543210"; // NOSONAR

	/** LiveKit 은 iss 로 API key 를 찾는다. livekit.yaml 의 keys: 항목에 있는 이름이다. */
	private static final String API_KEY = "APIkeyabcdef123";
	private static final String URL = "wss://livekit.example.com";
	private static final String ROOM_PREFIX = "u_";
	private static final long TTL_MILLIS = 120_000L;

	private LiveKitTokenIssuer issuerWith(String apiSecret) {
		return new LiveKitTokenIssuer(
				API_KEY, apiSecret, URL, ACCESS_TOKEN_SECRET, ROOM_PREFIX, TTL_MILLIS);
	}

	private Claims parse(String token) {
		return Jwts.parser()
				.verifyWith(Keys.hmacShaKeyFor(API_SECRET.getBytes(UTF_8)))
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	@Test
	@DisplayName("서명 알고리즘은 항상 HS256 이다 — 키가 길어도 HS512 로 올라가지 않는다")
	void alwaysSignsWithHs256() {
		// 인자 없는 signWith(key) 는 키 길이에 맞는 가장 강한 HMAC 을 고른다.
		// 64바이트 시크릿(= openssl rand -hex 32)이면 HS512 가 되는데, LiveKit 은 HS256
		// 으로 서명된 토큰을 기대하므로 토큰이 통째로 거절된다. 거절 사유는 구체적으로
		// 돌아오지 않아서 원인을 찾기 어렵다 — 그래서 여기서 고정한다.
		String sixtyFourByteSecret = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // NOSONAR
		assertThat(sixtyFourByteSecret.getBytes(UTF_8)).hasSize(64);

		LiveKitTokenIssuer issuer = new LiveKitTokenIssuer(
				API_KEY, sixtyFourByteSecret, URL, ACCESS_TOKEN_SECRET, ROOM_PREFIX, TTL_MILLIS);

		String algorithm = Jwts.parser()
				.verifyWith(Keys.hmacShaKeyFor(sixtyFourByteSecret.getBytes(UTF_8)))
				.build()
				.parseSignedClaims(issuer.issue(1L, "지우").token())
				.getHeader()
				.getAlgorithm();

		assertThat(algorithm).isEqualTo("HS256");
	}

	@Test
	@DisplayName("발급된 토큰의 클레임이 LiveKit 검증 규칙과 맞는다")
	void issuesTokenMatchingLiveKitContract() {
		VoiceSessionResponse response = issuerWith(API_SECRET).issue(42L, "지우");

		assertThat(response.roomId()).isEqualTo("u_42");
		assertThat(response.url()).isEqualTo(URL);
		assertThat(response.expiresInSeconds()).isEqualTo(120);

		Claims claims = parse(response.token());

		// LiveKit 은 sub 를 참가자 identity 로, name 을 표시 이름으로 읽는다.
		assertThat(claims.getSubject()).isEqualTo("42");
		assertThat(claims.get("name", String.class)).isEqualTo("지우");

		// iss 로 검증에 쓸 시크릿을 찾으므로 API key 가 들어가야 한다.
		assertThat(claims.getIssuer()).isEqualTo(API_KEY);

		// 권한은 video 안에 중첩된다. 평면 room 클레임으로 되돌아가면 LiveKit 이 조용히
		// 무시해서, 서명은 맞고 입장만 거절되는 토큰이 된다.
		assertThat(claims.get("room")).isNull();

		@SuppressWarnings("unchecked")
		Map<String, Object> video = claims.get("video", Map.class);
		assertThat(video)
				.containsEntry("room", "u_42")
				.containsEntry("roomJoin", true);

		// LiveKit 은 audience 를 검증하지 않는다 — 의미 없는 클레임은 싣지 않는다.
		assertThat(claims.getAudience()).isNull();

		assertThat(claims.getExpiration()).isNotNull();
	}

	@Test
	@DisplayName("토큰 수명이 설정한 TTL 과 일치한다")
	void honoursConfiguredTtl() {
		VoiceSessionResponse response = issuerWith(API_SECRET).issue(7L, "테스터");
		Claims claims = parse(response.token());

		Date issuedAt = claims.getIssuedAt();
		Date expiration = claims.getExpiration();

		assertThat(expiration.getTime() - issuedAt.getTime()).isEqualTo(TTL_MILLIS);
	}

	@Test
	@DisplayName("room 클레임은 사용자마다 갈린다 — 남의 방에 들어갈 수 없다")
	void derivesRoomPerUser() {
		LiveKitTokenIssuer issuer = issuerWith(API_SECRET);

		assertThat(issuer.issue(1L, "가").roomId()).isEqualTo("u_1");
		assertThat(issuer.issue(2L, "나").roomId()).isEqualTo("u_2");
	}

	@Test
	@DisplayName("시크릿이 비어 있으면 기동은 되지만 발급만 실패한다")
	void disablesIssuingWhenSecretMissing() {
		// 생성자가 예외를 던지면 컨텍스트가 통째로 죽어 로그인까지 못 하게 된다.
		LiveKitTokenIssuer issuer = issuerWith("");

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	@DisplayName("시크릿이 32바이트보다 짧으면 발급하지 않는다 — --dev 의 'secret' 이 여기 걸린다")
	void disablesIssuingWhenSecretTooShort() {
		LiveKitTokenIssuer issuer = issuerWith("secret");

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	@DisplayName("시크릿이 JWT_SECRET 과 같으면 발급하지 않는다 — 두 시스템의 격리가 사라진다")
	void disablesIssuingWhenSecretEqualsAccessTokenSecret() {
		// HS256 은 검증 키 = 서명 키다. 두 값이 같으면 LiveKit 서버가 우리 액세스 토큰을
		// 위조할 수 있다. `.env` 를 복붙하다 두 칸에 같은 값을 넣는 실수로 충분히 일어나고,
		// 그때 증상이 없다는 것이 위험한 지점이라 경고가 아니라 비활성으로 막는다.
		LiveKitTokenIssuer issuer = issuerWith(ACCESS_TOKEN_SECRET);

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	@DisplayName("API key 가 비어 있으면 발급하지 않는다 — iss 가 빈 토큰은 LiveKit 이 전부 거절한다")
	void disablesIssuingWhenApiKeyMissing() {
		LiveKitTokenIssuer issuer = new LiveKitTokenIssuer(
				"", API_SECRET, URL, ACCESS_TOKEN_SECRET, ROOM_PREFIX, TTL_MILLIS);

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}

	@Test
	@DisplayName("URL 이 비어 있으면 발급하지 않는다 — 붙을 곳 없는 토큰만 쥐여주게 된다")
	void disablesIssuingWhenUrlMissing() {
		LiveKitTokenIssuer issuer = new LiveKitTokenIssuer(
				API_KEY, API_SECRET, "", ACCESS_TOKEN_SECRET, ROOM_PREFIX, TTL_MILLIS);

		assertThatThrownBy(() -> issuer.issue(1L, "지우"))
				.isInstanceOf(BusinessException.class);
	}
}
