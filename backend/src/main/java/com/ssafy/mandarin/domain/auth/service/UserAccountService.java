package com.ssafy.mandarin.domain.auth.service;

import com.ssafy.mandarin.domain.user.dto.MyProfileResponse;
import com.ssafy.mandarin.domain.user.dto.PointResponse;
import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.mandarin.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserAccountService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final OAuthIdentityRepository oAuthIdentityRepository;

	@Transactional(readOnly = true)
	public MyProfileResponse getMyProfile(String uuid) {
		User user = findActiveUser(uuid);
		return MyProfileResponse.from(user);
	}

	@Transactional(readOnly = true)
	public PointResponse getPoints(String uuid) {
		User user = findActiveUser(uuid);
		return PointResponse.of(user.getPoint());
	}

	public String updateName(String uuid, String name) {
		User user = findActiveUser(uuid);
		user.updateName(name.trim());
		log.info("Name updated: userId={}", user.getId());
		return user.getName();
	}

	public String updateNickname(String uuid, String nickname) {
		if (userRepository.existsByNickname(nickname)) {
			throw new BusinessException(ErrorCode.DUPLICATE_EMAIL); // 닉네임 중복
		}
		User user = findActiveUser(uuid);
		user.updateNickname(nickname.trim());
		log.info("Nickname updated: userId={}", user.getId());
		return user.getNickname();
	}

	public void deleteAccount(String uuid) {
		User user = findActiveUser(uuid);
		Long userId = user.getId();

		oAuthIdentityRepository.deleteByUser(user);
		refreshTokenRepository.deleteByUuid(uuid);

		user.withdraw();
		log.info("Account withdrawn: userId={}", userId);
	}

	// UUID 기준으로 활성화된 유저 찾기
	private User findActiveUser(String uuid) {
		return userRepository.findByUuid(uuid)
				.filter(user -> !user.isWithdrawn())
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
	}
}
