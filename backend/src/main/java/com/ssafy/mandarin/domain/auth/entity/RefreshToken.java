package com.ssafy.mandarin.domain.auth.entity;

import java.time.LocalDateTime;

import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 기기(세션) 하나의 리프레시 토큰.
 *
 * <p>사용자당 한 행이 아니라 <b>기기당 한 행</b>이다. uuid 에 UNIQUE 를 걸어두면 PC 로그인이
 * 모바일 세션을 끊는다. 대신 device_id 가 UNIQUE 이고, 토큰은 해시로만 저장한다.
 */
@Entity
@Table(name = "refresh_token")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RefreshToken extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** 사용자 uuid. 한 사용자가 여러 행(기기)을 가질 수 있다. */
	@Column(nullable = false)
	private String uuid;

	/** 기기 식별자. 리프레시 토큰 클레임에 실려 어느 세션인지 가린다. */
	@Column(name = "device_id", nullable = false, unique = true, length = 64)
	private String deviceId;

	/** 원문이 아니라 SHA-256 해시. DB 가 새도 토큰 자체는 새지 않는다. */
	@Column(nullable = false)
	private String token;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	public void updateToken(String newToken, LocalDateTime newExpiresAt) {
		this.token = newToken;
		this.expiresAt = newExpiresAt;
	}
}
