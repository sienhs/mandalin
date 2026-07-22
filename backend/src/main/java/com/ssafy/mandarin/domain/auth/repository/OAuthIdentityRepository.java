package com.ssafy.mandarin.domain.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.auth.entity.OAuthIdentity;
import com.ssafy.mandarin.domain.auth.entity.OAuthProvider;
import com.ssafy.mandarin.domain.auth.entity.User;

public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentity, Long> {

	@EntityGraph(attributePaths = "user")
	Optional<OAuthIdentity> findByProviderAndProviderUserId(OAuthProvider provider, String providerUserId);

	void deleteByUser(User user);
}
