package com.ssafy.mandarin.domain.auth.service;

import java.util.Map;
import java.util.UUID;

import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.entity.OAuthIdentity;
import com.ssafy.mandarin.domain.auth.entity.OAuthProvider;
import com.ssafy.mandarin.domain.auth.repository.OAuthIdentityRepository;
import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OAuthLoginService {

	private final OAuthIdentityRepository oAuthIdentityRepository;
	private final UserRepository userRepository;


	// 신원 조회 또는 신원 생성 후 반환
	@Transactional
	public User resolveUser(OAuth2AuthenticationToken authentication) {
		OAuthProvider provider = OAuthProvider.fromRegistrationId(authentication.getAuthorizedClientRegistrationId());
		OAuthUserProfile profile = kakaoProfile(authentication.getPrincipal().getAttributes());

		return oAuthIdentityRepository.findByProviderAndProviderUserId(provider, profile.providerUserId())
				.map(OAuthIdentity::getUser)
				.map(this::requireActive)
				.orElseGet(() -> connectNewIdentity(provider, profile));
	}

	/**
	 * 가입 축하 포인트.
	 *
	 * <p>가입 직후 포인트가 0 이면 상점에 200종이 넘는 건물이 있어도 아무것도 살 수 없고,
	 * 과제를 수십 번 완료해야 첫 건물이 손에 들어온다. 그때까지는 "포인트를 모아 도시를
	 * 짓는다"는 서비스의 핵심 루프를 경험할 수 없다. 일반 건물이 300P 이므로
	 * 30채 남짓 지어 볼 수 있는 양을 처음에 준다.
	 */
	private static final int WELCOME_POINT = 10_000;

	// 신원 재등록
	private User connectNewIdentity(OAuthProvider provider, OAuthUserProfile profile) {
		User user = userRepository.save(User.builder()
				.uuid(UUID.randomUUID().toString())
				.name(profile.name())
				.point(WELCOME_POINT)
				.build());


		oAuthIdentityRepository.save(OAuthIdentity.builder()
				.user(user)
				.provider(provider)
				.providerUserId(profile.providerUserId())
				.build());
		return user;
	}

	//
	private OAuthUserProfile kakaoProfile(Map<String, Object> attributes) {
		String idValue = requiredString(attributes.get("id"));
		Map<String, Object> account = optionalMap(attributes.get("kakao_account"));
		Map<String, Object> profile = optionalMap(account.get("profile"));
		Map<String, Object> properties = optionalMap(attributes.get("properties"));

		Object nickname = firstPresent(profile.get("nickname"), properties.get("nickname"), "user");
		return new OAuthUserProfile(idValue, idValue, normalizeName(nickname.toString()));
	}

	private User requireActive(User user) {
		if (user.isWithdrawn()) {
			throw new BusinessException(ErrorCode.OAUTH_LOGIN_FAILED);
		}
		return user;
	}

	private String normalizeName(String rawName) {
		String normalized = rawName.replaceAll("[^\\p{L}\\p{N}]", "");
		if (normalized.codePointCount(0, normalized.length()) < 2) {
			return "user";
		}
		int endIndex = normalized.offsetByCodePoints(0, Math.min(20, normalized.codePointCount(0, normalized.length())));
		return normalized.substring(0, endIndex);
	}

	private String requiredString(Object value) {
		if (value == null || value.toString().isBlank()) {
			throw new BusinessException(ErrorCode.OAUTH_LOGIN_FAILED);
		}
		return value.toString();
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> optionalMap(Object value) {
		if (value instanceof Map<?, ?> map) {
			return (Map<String, Object>) map;
		}
		return Map.of();
	}

	private Object firstPresent(Object... values) {
		for (Object value : values) {
			if (value != null && !value.toString().isBlank()) {
				return value;
			}
		}
		return null;
	}

	private record OAuthUserProfile(String providerUserId, String uuid, String name) { }
}
