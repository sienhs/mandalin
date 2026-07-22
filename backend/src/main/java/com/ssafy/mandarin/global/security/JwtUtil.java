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

	public String generateAccessToken(String email) {
		return buildToken(email, accessTokenExpiration, ACCESS_TOKEN_TYPE);
	}

	public String generateRefreshToken(String email) {
		return buildToken(email, refreshTokenExpiration, REFRESH_TOKEN_TYPE);
	}

	public String extractEmail(String token) {
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

	private String buildToken(String email, long expiration, String tokenType) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expiration);

		return Jwts.builder()
				.subject(email)
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
