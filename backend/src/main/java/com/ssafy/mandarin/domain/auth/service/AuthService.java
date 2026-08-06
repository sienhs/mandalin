package com.ssafy.mandarin.domain.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.dto.LoginResponse;
import com.ssafy.mandarin.domain.auth.dto.ReissuedTokens;
import com.ssafy.mandarin.domain.auth.dto.UserProfileResponse;
import com.ssafy.mandarin.domain.auth.entity.OAuthIdentity;
import com.ssafy.mandarin.domain.auth.entity.OAuthProvider;
import com.ssafy.mandarin.domain.auth.entity.RefreshToken;
import com.ssafy.mandarin.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.mandarin.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

	private static final int REFRESH_TOKEN_DAYS = 7;

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final OAuthIdentityRepository oAuthIdentityRepository;
	private final RefreshTokenRevoker refreshTokenRevoker;
	private final JwtUtil jwtUtil;

	/** 로그인. 기기 세션을 새로 하나 연다 — 다른 기기의 세션은 건드리지 않는다. */
	@Transactional
	public LoginResponse loginWithOAuth(Long userId) {
		User user = userRepository.findById(userId)
				.filter(candidate -> !candidate.isWithdrawn())
				.orElseThrow(() -> new BusinessException(ErrorCode.OAUTH_LOGIN_FAILED));

		String deviceId = UUID.randomUUID().toString();
		String refreshToken = jwtUtil.generateRefreshToken(user.getUuid(), deviceId);

		refreshTokenRepository.save(RefreshToken.builder()
				.uuid(user.getUuid())
				.deviceId(deviceId)
				.token(hashToken(refreshToken))
				.expiresAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")).plusDays(REFRESH_TOKEN_DAYS))
				.build());

		log.info("Login succeeded: userId={}, deviceId={}", user.getId(), deviceId);
		return LoginResponse.of(
				toProfile(user), jwtUtil.generateAccessToken(user.getUuid()), refreshToken);
	}

	/**
	 * 액세스 토큰 재발급. 리프레시 토큰도 같은 기기 세션 안에서 회전시킨다.
	 *
	 * <p>회전하지 않으면 한 번 탈취된 리프레시 토큰이 만료일까지 그대로 유효하다.
	 * 회전 후 옛 토큰이 다시 들어오면 탈취로 보고 <b>그 사용자의 모든 기기 세션</b>을 끊는다.
	 */
	@Transactional
	public ReissuedTokens reissue(String refreshToken) {
		if (!jwtUtil.isRefreshToken(refreshToken)) {
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}

		String uuid = jwtUtil.extractSubject(refreshToken);
		String deviceId = jwtUtil.extractDeviceId(refreshToken);
		if (deviceId == null) {
			// 기기 식별자 도입 이전에 발급된 토큰. 다시 로그인시킨다.
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}

		RefreshToken session = refreshTokenRepository.findByDeviceId(deviceId)
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

		// 서명은 유효한데 저장된 해시와 다르다 = 이미 회전된 옛 토큰이 다시 왔다.
		if (!session.getToken().equals(hashToken(refreshToken))) {
			// 아래에서 던지는 예외로 이 트랜잭션은 롤백된다. 폐기는 별도 트랜잭션이어야 살아남는다.
			refreshTokenRevoker.revokeAllSessions(uuid);
			log.warn("Refresh token reuse detected: uuid={}", uuid);
			throw new BusinessException(ErrorCode.INVALID_TOKEN);
		}

		if (session.getExpiresAt().isBefore(LocalDateTime.now(ZoneId.of("Asia/Seoul")))) {
			throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
		}

		// 탈퇴 처리에서 토큰을 지우긴 하지만, 그 경로를 놓쳐도 재발급이 되면 안 된다.
		userRepository.findByUuid(uuid)
				.filter(user -> !user.isWithdrawn())
				.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

		String rotated = jwtUtil.generateRefreshToken(uuid, deviceId);
		session.updateToken(hashToken(rotated), LocalDateTime.now(ZoneId.of("Asia/Seoul")).plusDays(REFRESH_TOKEN_DAYS));

		return new ReissuedTokens(jwtUtil.generateAccessToken(uuid), rotated);
	}

	@Transactional(readOnly = true)
	public UserProfileResponse getProfile(String uuid) {
		User user = userRepository.findByUuid(uuid)
				.filter(candidate -> !candidate.isWithdrawn())
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
		return toProfile(user);
	}

	/** 이 기기만 로그아웃한다. 다른 기기의 세션은 유지된다. */
	@Transactional
	public void logout(String deviceId) {
		refreshTokenRepository.deleteByDeviceId(deviceId);
		log.info("Logout: deviceId={}", deviceId);
	}

	private UserProfileResponse toProfile(User user) {
		String kakaoId = oAuthIdentityRepository.findByUserAndProvider(user, OAuthProvider.KAKAO)
				.map(OAuthIdentity::getProviderUserId)
				.orElse(null);
		return UserProfileResponse.of(user, kakaoId);
	}

	private String hashToken(String token) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available.", exception);
		}
	}
}
