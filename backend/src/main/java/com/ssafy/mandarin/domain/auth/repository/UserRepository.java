package com.ssafy.mandarin.domain.auth.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUuid(String uuid);
	Optional<User> findByUuidIgnoreCase(String uuid);

	boolean existsByUuid(String uuid);

	List<User> findByDeletedAtIsNullOrderByIdAsc();

	/**
	 * 포인트를 쓰기 전에 유저 행을 잠근다.
	 *
	 * <p>잠그지 않으면 두 요청이 같은 잔액을 읽고 각자 차감해 포인트가 음수가 된다
	 * (예: 잔액 500 에서 300 짜리 두 건이 동시에 통과). 결제 경로에서만 쓴다.
	 */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select u from User u where u.id = :id")
	Optional<User> findByIdForUpdate(@Param("id") Long id);
}
