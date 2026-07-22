package com.ssafy.mandarin.global.security;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Single owner of the refresh token cookie. Issuing and clearing must use identical
 * name/path/attributes or the browser treats them as different cookies and the clear is a no-op.
 */
@Component
public class RefreshTokenCookie {

	public static final String NAME = "refresh_token";
	private static final String PATH = "/api/auth";

	private final boolean secure;
	private final String sameSite;
	private final Duration maxAge;

	public RefreshTokenCookie(
			@Value("${auth.refresh-cookie-secure:false}") boolean secure,
			@Value("${auth.refresh-cookie-same-site:Lax}") String sameSite,
			@Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration
	) {
		this.secure = secure;
		this.sameSite = sameSite;
		this.maxAge = Duration.ofMillis(refreshTokenExpiration);
	}

	public void set(HttpServletResponse response, String token) {
		response.addHeader(HttpHeaders.SET_COOKIE, build(token, maxAge).toString());
	}

	public void clear(HttpServletResponse response) {
		response.addHeader(HttpHeaders.SET_COOKIE, build("", Duration.ZERO).toString());
	}

	public Optional<String> extract(HttpServletRequest request) {
		if (request.getCookies() == null) {
			return Optional.empty();
		}
		return Arrays.stream(request.getCookies())
				.filter(cookie -> NAME.equals(cookie.getName()))
				.map(Cookie::getValue)
				.findFirst();
	}

	private ResponseCookie build(String value, Duration age) {
		return ResponseCookie.from(NAME, value)
				.httpOnly(true)
				.secure(secure)
				.sameSite(sameSite)
				.path(PATH)
				.maxAge(age)
				.build();
	}
}
