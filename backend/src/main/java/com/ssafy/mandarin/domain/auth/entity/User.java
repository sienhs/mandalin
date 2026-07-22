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

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class User extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String name;

	private LocalDateTime deletedAt;

	public void updateName(String name) {
		this.name = name;
	}

	/**
	 * Releases the email so the person can sign up again later, since {@code users.email} is
	 * unique and the row is kept for soft-delete auditing.
	 */
	public void withdraw() {
		this.email = "withdrawn-" + this.id + "@deleted.local";
		this.name = "withdrawn user";
		this.deletedAt = LocalDateTime.now();
	}

	public boolean isWithdrawn() {
		return this.deletedAt != null;
	}
}
