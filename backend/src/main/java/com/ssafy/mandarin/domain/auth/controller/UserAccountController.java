package com.ssafy.mandarin.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.dto.ProfileUpdateRequest;
import com.ssafy.mandarin.domain.auth.dto.UserProfileResponse;
import com.ssafy.mandarin.domain.auth.service.AuthService;
import com.ssafy.mandarin.domain.auth.service.UserAccountService;
import com.ssafy.mandarin.global.response.ApiResponse;
import com.ssafy.mandarin.global.security.RefreshTokenCookie;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
@Tag(name = "User Account", description = "Profile update and account withdrawal")
public class UserAccountController {

	private final UserAccountService userAccountService;
	private final AuthService authService;
	private final RefreshTokenCookie refreshTokenCookie;

	/**
	 * 내 프로필 조회.
	 *
	 * <p>액세스 토큰 재발급 응답에는 토큰 문자열뿐이라, 새로고침한 클라이언트는 자기가 누구인지
	 * 알 방법이 없다. 세션 복원 직후 이 엔드포인트로 사용자 정보를 되찾는다.
	 */
	@GetMapping
	@Operation(summary = "Get my profile")
	public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
			@AuthenticationPrincipal UserDetails userDetails
	) {
		UserProfileResponse profile = authService.getProfile(userDetails.getUsername());
		return ResponseEntity.ok(ApiResponse.success("Profile loaded", profile));
	}

	@PatchMapping
	@Operation(summary = "Update display name")
	public ResponseEntity<ApiResponse<String>> updateProfile(
			@AuthenticationPrincipal UserDetails userDetails,
			@RequestBody @Valid ProfileUpdateRequest request
	) {
		String name = userAccountService.updateName(userDetails.getUsername(), request.name());
		return ResponseEntity.ok(ApiResponse.success("Name updated", name));
	}

	@DeleteMapping
	@Operation(summary = "Withdraw account")
	public ResponseEntity<ApiResponse<Void>> deleteAccount(
			@AuthenticationPrincipal UserDetails userDetails,
			HttpServletResponse response
	) {
		userAccountService.deleteAccount(userDetails.getUsername());
		refreshTokenCookie.clear(response);
		return ResponseEntity.ok(ApiResponse.success("Account withdrawn"));
	}
}
