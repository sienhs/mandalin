package com.example.starter.domain.auth.service;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.starter.domain.auth.dto.LoginResponse;
import com.example.starter.domain.auth.entity.RefreshToken;
import com.example.starter.domain.auth.entity.User;
import com.example.starter.domain.auth.repository.RefreshTokenRepository;
import com.example.starter.domain.auth.repository.UserRepository;
import com.example.starter.global.exception.BusinessException;
import com.example.starter.global.exception.ErrorCode;
import com.example.starter.global.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtUtil jwtUtil;

	@Transactional
	public LoginResponse loginWithOAuth(Long userId) {
		User user = userRepository.findById(userId)
				.filter(candidate -> !candidate.isWithdrawn())
				.orElseThrow(() -> new BusinessException(ErrorCode.OAUTH_LOGIN_FAILED));
		return issueTokens(user);
	}

	private LoginResponse issueTokens(User user) {
		String accessToken = jwtUtil.generateAccessToken(user.getEmail());
		String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
		String refreshTokenHash = hashToken(refreshToken);

		refreshTokenRepository.findByEmail(user.getEmail())
				.ifPresentOrElse(
						token -> token.updateToken(refreshTokenHash, LocalDateTime.now().plusDays(7)),
						() -> refreshTokenRepository.save(RefreshToken.builder()
								.email(user.getEmail())
								.token(refreshTokenHash)
								.expiresAt(LocalDateTime.now().plusDays(7))
								.build()));

		log.info("Login succeeded: userId={}", user.getId());
		return LoginResponse.builder()
				.userId(user.getId())
				.accessToken(accessToken)
				.name(user.getName())
				.email(user.getEmail())
				.refreshToken(refreshToken)
				.build();
	}

	@Transactional
	public String reissue(String refreshToken) {
		if (!jwtUtil.isRefreshToken(refreshToken)) {
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}

		RefreshToken saved = refreshTokenRepository.findByToken(hashToken(refreshToken))
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

		if (saved.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
		}

		return jwtUtil.generateAccessToken(saved.getEmail());
	}

	private String hashToken(String token) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available.", exception);
		}
	}

	@Transactional
	public void logout(String email) {
		refreshTokenRepository.deleteByEmail(email);
		log.info("Logout: {}", email);
	}
}
