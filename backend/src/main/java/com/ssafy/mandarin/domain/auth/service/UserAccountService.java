package com.ssafy.mandarin.domain.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.entity.User;
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

	public String updateName(String email, String name) {
		User user = findActiveUser(email);
		user.updateName(name.trim());
		log.info("Name updated: userId={}", user.getId());
		return user.getName();
	}

	public void deleteAccount(String email) {
		User user = findActiveUser(email);
		Long userId = user.getId();

		// Both must go before the email is released: a lingering identity would make every
		// future social login resolve to this withdrawn row and fail permanently.
		oAuthIdentityRepository.deleteByUser(user);
		refreshTokenRepository.deleteByEmail(email);

		user.withdraw();
		log.info("Account withdrawn: userId={}", userId);
	}

	private User findActiveUser(String email) {
		return userRepository.findByEmail(email)
				.filter(user -> !user.isWithdrawn())
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
	}
}
