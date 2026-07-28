package com.ssafy.mandarin.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.dto.NicknameUpdateRequest;
import com.ssafy.mandarin.domain.auth.dto.ProfileUpdateRequest;
import com.ssafy.mandarin.domain.auth.service.UserAccountService;
import com.ssafy.mandarin.global.response.ApiResponse;
import com.ssafy.mandarin.global.security.RefreshTokenCookie;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;

import com.ssafy.mandarin.domain.user.dto.MyProfileResponse;
import com.ssafy.mandarin.domain.user.dto.PointResponse;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "User Account", description = "Profile update and account withdrawal")
public class UserAccountController {

	private final UserAccountService userAccountService;
	private final RefreshTokenCookie refreshTokenCookie;

	@GetMapping
	@Operation(summary = "Get my profile")
	public ResponseEntity<ApiResponse<MyProfileResponse>> getMyProfile(
			@AuthenticationPrincipal UserDetails userDetails
	) {
		MyProfileResponse profile = userAccountService.getMyProfile(userDetails.getUsername());
		return ResponseEntity.ok(ApiResponse.success("My profile retrieved", profile));
	}

	@GetMapping("/points")
	@Operation(summary = "Get my points")
	public ResponseEntity<ApiResponse<PointResponse>> getPoints(
			@AuthenticationPrincipal UserDetails userDetails
	) {
		PointResponse point = userAccountService.getPoints(userDetails.getUsername());
		return ResponseEntity.ok(ApiResponse.success("Points retrieved", point));
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

	@PutMapping("/nickname")
	@Operation(summary = "Update nickname")
	public ResponseEntity<ApiResponse<String>> updateNickname(
			@AuthenticationPrincipal UserDetails userDetails,
			@RequestBody @Valid NicknameUpdateRequest request
	) {
		String nickname = userAccountService.updateNickname(userDetails.getUsername(), request.nickname());
		return ResponseEntity.ok(ApiResponse.success("Nickname updated", nickname));
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
