package com.ssafy.mandarin.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

	private static final String TOKEN_TYPE_CLAIM = "tokenType";
	private static final String DEVICE_ID_CLAIM = "deviceId";
	private static final String ACCESS_TOKEN_TYPE = "access";
	private static final String REFRESH_TOKEN_TYPE = "refresh";

	private final SecretKey secretKey;
	private final long accessTokenExpiration;
	private final long refreshTokenExpiration;

	public JwtUtil(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.access-token-expiration}") long accessTokenExpiration,
			@Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration
	) {
		this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenExpiration = accessTokenExpiration;
		this.refreshTokenExpiration = refreshTokenExpiration;
	}

	public String generateAccessToken(String uuid) {
		return buildToken(uuid, accessTokenExpiration, ACCESS_TOKEN_TYPE);
	}

	/**
	 * 기기별 리프레시 토큰. deviceId 로 어느 세션인지 가려내므로 사용자당 여러 기기를 둘 수 있다.
	 */
	public String generateRefreshToken(String uuid, String deviceId) {
		Date now = new Date();
		return Jwts.builder()
				.subject(uuid)
				.claim(TOKEN_TYPE_CLAIM, REFRESH_TOKEN_TYPE)
				.claim(DEVICE_ID_CLAIM, deviceId)
				.issuedAt(now)
				.expiration(new Date(now.getTime() + refreshTokenExpiration))
				.signWith(secretKey)
				.compact();
	}

	/** 리프레시 토큰의 기기 식별자. 없으면 null(구버전 토큰). */
	public String extractDeviceId(String token) {
		return getClaims(token).get(DEVICE_ID_CLAIM, String.class);
	}

	/**
	 * 토큰 주체 = 사용자 uuid.
	 *
	 * <p>이 프로젝트에는 이메일이 없다(카카오에서 profile_nickname 만 받는다).
	 * 예전 이름이 extractEmail 이라 호출부마다 email 변수에 uuid 를 담는 오해가 있었다.
	 */
	public String extractSubject(String token) {
		return getClaims(token).getSubject();
	}

	/**
	 * Access and refresh tokens are signed with the same key, so the token type must be
	 * checked explicitly. Without this a stolen refresh token would authenticate API calls
	 * for its full lifetime.
	 */
	public boolean isAccessToken(String token) {
		return isTokenOfType(token, ACCESS_TOKEN_TYPE);
	}

	public boolean isRefreshToken(String token) {
		return isTokenOfType(token, REFRESH_TOKEN_TYPE);
	}

	private boolean isTokenOfType(String token, String expectedType) {
		try {
			return expectedType.equals(getClaims(token).get(TOKEN_TYPE_CLAIM, String.class));
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	private String buildToken(String uuid, long expiration, String tokenType) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expiration);

		return Jwts.builder()
				.subject(uuid)
				.claim(TOKEN_TYPE_CLAIM, tokenType)
				.issuedAt(now)
				.expiration(expiryDate)
				.signWith(secretKey)
				.compact();
	}

	private Claims getClaims(String token) {
		return Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}
