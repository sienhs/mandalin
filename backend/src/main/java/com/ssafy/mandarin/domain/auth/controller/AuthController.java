package com.ssafy.mandarin.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.dto.LoginResponse;
import com.ssafy.mandarin.domain.auth.dto.OAuthCodeExchangeRequest;
import com.ssafy.mandarin.domain.auth.service.AuthService;
import com.ssafy.mandarin.domain.auth.service.OAuthAuthorizationCodeStore;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.response.ApiResponse;
import com.ssafy.mandarin.global.security.RefreshTokenCookie;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
	private final RefreshTokenCookie refreshTokenCookie;

	@PostMapping("/oauth/exchange")
	@Operation(summary = "Exchange social login code")
	public ResponseEntity<ApiResponse<LoginResponse>> exchangeOAuthCode(
			@RequestBody @Valid OAuthCodeExchangeRequest request,
			HttpServletResponse response
	) {
		Long userId = oAuthAuthorizationCodeStore.consume(request.code());
		LoginResponse loginResponse = authService.loginWithOAuth(userId);
		refreshTokenCookie.set(response, loginResponse.getRefreshToken());

		LoginResponse safeResponse = LoginResponse.builder()
				.userId(loginResponse.getUserId())
				.accessToken(loginResponse.getAccessToken())
				.name(loginResponse.getName())
				.uuid(loginResponse.getUuid())
				.build();
		return ResponseEntity.ok(ApiResponse.success("Social login succeeded", safeResponse));
	}

	@PostMapping("/reissue")
	@Operation(summary = "Reissue access token")
	public ResponseEntity<ApiResponse<String>> reissue(HttpServletRequest request) {
		String refreshToken = refreshTokenCookie.extract(request)
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));
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

		refreshTokenCookie.clear(response);

		return ResponseEntity.ok(ApiResponse.success("Logout succeeded"));
	}
}
