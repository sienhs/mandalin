package com.example.starter.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.starter.domain.auth.dto.ProfileUpdateRequest;
import com.example.starter.domain.auth.service.UserAccountService;
import com.example.starter.global.response.ApiResponse;
import com.example.starter.global.security.RefreshTokenCookie;

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
	private final RefreshTokenCookie refreshTokenCookie;

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
