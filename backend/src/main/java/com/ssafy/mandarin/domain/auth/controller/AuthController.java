package com.ssafy.mandarin.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.dto.LoginResponse;
import com.ssafy.mandarin.domain.auth.dto.OAuthCodeExchangeRequest;
import com.ssafy.mandarin.domain.auth.dto.ReissuedTokens;
import com.ssafy.mandarin.domain.auth.service.AuthService;
import com.ssafy.mandarin.domain.auth.service.OAuthAuthorizationCodeStore;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.response.ApiResponse;
import com.ssafy.mandarin.global.security.JwtUtil;
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
	private final JwtUtil jwtUtil;

	@PostMapping("/oauth/exchange")
	@Operation(summary = "Exchange social login code")
	public ResponseEntity<ApiResponse<LoginResponse>> exchangeOAuthCode(
			@RequestBody @Valid OAuthCodeExchangeRequest request,
			HttpServletResponse response
	) {
		Long userId = oAuthAuthorizationCodeStore.consume(request.code());
		LoginResponse loginResponse = authService.loginWithOAuth(userId);
		// refreshToken 은 @JsonIgnore 라 본문에 실리지 않는다. 쿠키로만 나간다.
		refreshTokenCookie.set(response, loginResponse.refreshToken());

		return ResponseEntity.ok(ApiResponse.success("Social login succeeded", loginResponse));
	}

	@PostMapping("/reissue")
	@Operation(
			summary = "Reissue access token",
			description = "리프레시 토큰도 함께 회전한다. 이미 회전된 옛 토큰이 들어오면 해당 사용자의 세션을 전부 끊는다."
	)
	public ResponseEntity<ApiResponse<String>> reissue(
			HttpServletRequest request,
			HttpServletResponse response
	) {
		String refreshToken = refreshTokenCookie.extract(request)
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

		ReissuedTokens tokens = authService.reissue(refreshToken);
		refreshTokenCookie.set(response, tokens.refreshToken());

		return ResponseEntity.ok(ApiResponse.success("Access token reissued", tokens.accessToken()));
	}

	/**
	 * 로그아웃.
	 *
	 * <p>인증을 요구하지 않는다. 액세스 토큰은 30분이라 만료된 뒤에는 로그아웃 자체가 401 이 되어
	 * 서버에 리프레시 토큰이 남고 쿠키도 안 지워졌다. 리프레시 쿠키만으로 처리한다.
	 */
	@PostMapping("/logout")
	@Operation(summary = "Logout", description = "리프레시 쿠키 기준으로 세션을 폐기한다. 인증 불필요.")
	public ResponseEntity<ApiResponse<Void>> logout(
			HttpServletRequest request,
			HttpServletResponse response
	) {
		refreshTokenCookie.extract(request)
				.filter(jwtUtil::isRefreshToken)
				.map(jwtUtil::extractDeviceId)
				.ifPresent(authService::logout);

		// 토큰이 없거나 깨졌어도 쿠키는 지우고 성공으로 끝낸다 — 로그아웃은 실패할 이유가 없다.
		refreshTokenCookie.clear(response);
		return ResponseEntity.ok(ApiResponse.success("Logout succeeded"));
	}
}
