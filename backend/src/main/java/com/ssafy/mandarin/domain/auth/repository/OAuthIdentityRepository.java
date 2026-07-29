package com.ssafy.mandarin.domain.auth.repository;

import java.util.Optional;

import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.auth.entity.OAuthIdentity;
import com.ssafy.mandarin.domain.auth.entity.OAuthProvider;

public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentity, Long> {

	@EntityGraph(attributePaths = "user")
	Optional<OAuthIdentity> findByProviderAndProviderUserId(OAuthProvider provider, String providerUserId);

	/** 프로필 응답의 kakaoId 는 users 가 아니라 여기(provider_user_id)에 있다. */
	Optional<OAuthIdentity> findByUserAndProvider(User user, OAuthProvider provider);

	void deleteByUser(User user);
}
