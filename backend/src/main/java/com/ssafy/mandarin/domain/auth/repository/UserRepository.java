package com.ssafy.mandarin.domain.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	Optional<User> findByEmailIgnoreCase(String email);

	boolean existsByEmail(String email);

	List<User> findByDeletedAtIsNullOrderByIdAsc();
}
