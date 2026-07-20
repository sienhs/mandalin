package com.example.starter.domain.auth.controller;

import java.time.Duration;
import java.util.Arrays;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.starter.domain.auth.dto.LoginResponse;
import com.example.starter.domain.auth.dto.OAuthCodeExchangeRequest;
import com.example.starter.domain.auth.service.AuthService;
import com.example.starter.domain.auth.service.OAuthAuthorizationCodeStore;
import com.example.starter.global.exception.BusinessException;
import com.example.starter.global.exception.ErrorCode;
import com.example.starter.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Social login code exchange, token reissue, logout")
public class AuthController {
	private final AuthService authService;
	private final OAuthAuthorizationCodeStore oAuthAuthorizationCodeStore;

	@Value("${auth.refresh-cookie-secure:false}")
	private boolean refreshCookieSecure;

	@Value("${auth.refresh-cookie-same-site:Lax}")
	private String refreshCookieSameSite;

	private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

	@PostMapping("/oauth/exchange")
	@Operation(summary = "Exchange social login code")
	public ResponseEntity<ApiResponse<LoginResponse>> exchangeOAuthCode(
			@RequestBody @Valid OAuthCodeExchangeRequest request,
			HttpServletResponse response
	) {
		Long userId = oAuthAuthorizationCodeStore.consume(request.code());
		LoginResponse loginResponse = authService.loginWithOAuth(userId);
		setRefreshTokenCooke(response, loginResponse.getRefreshToken());

		LoginResponse safeResponse = LoginResponse.builder()
				.userId(loginResponse.getUserId())
				.accessToken(loginResponse.getAccessToken())
				.name(loginResponse.getName())
				.email(loginResponse.getEmail())
				.build();
		return ResponseEntity.ok(ApiResponse.success("Social login succeeded", safeResponse));
	}

	private void setRefreshTokenCooke(HttpServletResponse response, String token) {
		ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, token)
				.httpOnly(true)
				.secure(refreshCookieSecure)
				.sameSite(refreshCookieSameSite)
				.path("/api/auth")
				.maxAge(Duration.ofDays(7))
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	private String extractRefreshTokenFromCookie(HttpServletRequest request) {
		if (request.getCookies() == null) {
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}
		return Arrays.stream(request.getCookies())
				.filter(c -> REFRESH_TOKEN_COOKIE.equals(c.getName()))
				.map(Cookie::getValue)
				.findFirst()
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));
	}

	@PostMapping("/reissue")
	@Operation(summary = "Reissue access token")
	public ResponseEntity<ApiResponse<String>> reissue(HttpServletRequest request) {
		String refreshToken = extractRefreshTokenFromCookie(request);
		String newAccessToken = authService.reissue(refreshToken);
		return ResponseEntity.ok(ApiResponse.success("Access token reissued", newAccessToken));
	}

	@PostMapping("/logout")
	@Operation(summary = "Logout")
	public ResponseEntity<ApiResponse<Void>> logout(
			HttpServletResponse response,
			Authentication authentication
	) {
		if (authentication != null && authentication.isAuthenticated()) {
			String email = authentication.getName();
			authService.logout(email);
		}

		ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
				.httpOnly(true)
				.secure(refreshCookieSecure)
				.sameSite(refreshCookieSameSite)
				.path("/api/auth")
				.maxAge(Duration.ZERO)
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

		return ResponseEntity.ok(ApiResponse.success("Logout succeeded"));
	}
}
