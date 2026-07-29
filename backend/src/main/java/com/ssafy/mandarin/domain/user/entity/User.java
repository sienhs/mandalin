package com.ssafy.mandarin.domain.user.entity;

import java.time.LocalDateTime;

import com.ssafy.mandarin.global.entity.BaseEntity;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

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
     * 포인트를 차감한다.
     *
     * <p>잔액 검사를 도메인 안에 두는 이유: 호출자가 검사를 잊으면 잔액이 음수가 되고,
     * 그때는 이미 건물이 지급된 뒤라 되돌리기 어렵다. 여기서 막으면 어느 경로로 들어와도
     * 음수 잔액이 만들어지지 않는다.
     *
     * @throws BusinessException 잔액이 부족하거나 금액이 음수일 때 (아무것도 바꾸지 않는다)
     */
    public void usePoint(int amount) {
        if (amount < 0) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
        if (this.point < amount) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_POINT);
        }
        this.point -= amount;
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
