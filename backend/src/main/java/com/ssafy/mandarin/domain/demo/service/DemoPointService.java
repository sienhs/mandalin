package com.ssafy.mandarin.domain.demo.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 시연용 포인트 지급.
 *
 * <p>과제 완료 보상(포인트 적립)이 아직 없어서 사용자가 포인트를 얻을 방법이 없다. 상점에서
 * 건물을 사는 흐름을 보여주려면 잔액이 필요해서 임의 지급 통로를 둔다.
 *
 * <p><b>이것은 포인트 무한 생성기다.</b> {@code app.demo.enabled} 로 진행률 조작 API 와 함께
 * 꺼진다 — 스위치를 하나로 묶어 둔 이유는 정식 서비스 전에 한쪽만 끄고 다른 쪽을 잊는 일을
 * 막기 위해서다. 상점 경제가 성립해야 하는 시점에는 반드시 {@code DEMO_ENABLED=false} 다.
 *
 * <p>자기 계정에만 지급한다. 남에게 넣어줄 수 있으면 계정 간 이전 수단이 되어버린다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DemoPointService {

	private final UserRepository userRepository;

	/**
	 * 로그인한 사용자에게 포인트를 지급한다.
	 *
	 * <p>구매와 동시에 호출될 수 있으므로 유저 행을 잠근다 — 잠그지 않으면 지급과 차감이
	 * 같은 잔액을 읽어 한쪽이 사라진다(ShopService.purchase 와 같은 이유).
	 *
	 * @return 지급 후 잔액
	 */
	@Transactional
	public int grant(Long userId, int amount) {
		User user = userRepository.findByIdForUpdate(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		user.addPoint(amount);

		log.warn("[demo] user {} 에게 포인트 {} 지급 (잔액 {}) — 시연용 기능", userId, amount, user.getPoint());
		return user.getPoint();
	}
}
