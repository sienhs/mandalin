package com.ssafy.mandarin.domain.user.entity;

import java.time.LocalDateTime;

import com.ssafy.mandarin.global.entity.BaseEntity;

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

    String name;

    String uuid;

    int point;

    String profileImage;

    private LocalDateTime deletedAt;

    public void updateName(String name) {
        this.name = name;
    }

    /**
     * 소프트 삭제. 행은 감사 목적으로 남기고 표시 이름만 지운다.
     *
     * <p>재가입은 oauth_identities 를 지우는 것으로 열린다(UserAccountService 참고).
     * 이 프로젝트에는 이메일 컬럼이 없다 — 카카오에서 profile_nickname 만 받는다.
     */
    public void withdraw() {
        this.name = "withdrawn user";
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isWithdrawn() {
        return this.deletedAt != null;
    }
}
