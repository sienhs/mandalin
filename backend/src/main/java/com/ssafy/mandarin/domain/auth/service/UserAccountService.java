package com.ssafy.mandarin.domain.auth.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.auth.dto.DailyPointStatusResponse;
import com.ssafy.mandarin.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.mandarin.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.domain.subject.service.SubjectService;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
	private final SubjectLogRepository subjectLogRepository;

	/**
	 * 로그인한 유저의 보유 포인트 및 당일 포인트 획득 현황 조회.
	 */
	@Transactional(readOnly = true)
	public DailyPointStatusResponse getDailyPointStatus(String uuid) {
		User user = findActiveUser(uuid);
		LocalDate today = LocalDate.now();
		LocalDateTime todayStart = today.atStartOfDay();
		LocalDateTime todayEnd = today.atTime(23, 59, 59);

		long todayEarnedPoint = subjectLogRepository.sumEarnedPointByUserIdAndCreatedAtBetween(
				user.getId(), todayStart, todayEnd);
		long dailyPointLimit = SubjectService.DAILY_POINT_LIMIT;
		long remainingPointLimit = Math.max(0L, dailyPointLimit - todayEarnedPoint);

		return new DailyPointStatusResponse(
				user.getPoint(),
				todayEarnedPoint,
				dailyPointLimit,
				remainingPointLimit
		);
	}


	public String updateName(String uuid, String name) {

		User user = findActiveUser(uuid);
		user.updateName(name.trim());
		log.info("Name updated: userId={}", user.getId());
		return user.getName();
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
