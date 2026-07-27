package com.ssafy.mandarin.domain.auth.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUuid(String uuid);
	Optional<User> findByUuidIgnoreCase(String uuid);

	boolean existsByUuid(String uuid);

	List<User> findByDeletedAtIsNullOrderByIdAsc();
}
