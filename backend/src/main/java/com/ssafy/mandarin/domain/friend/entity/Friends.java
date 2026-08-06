package com.ssafy.mandarin.domain.friend.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.ssafy.mandarin.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "friends")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Friends {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 친구 관계에서 id가 더 작은 유저를 user1에 저장합니다.
     * UNIQUE 제약(user_id1, user_id2)과 함께 중복 관계를 방지합니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id1", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id2", nullable = false)
    private User user2;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

    /**
     * 특정 유저가 이 친구 관계에 속해 있는지 확인합니다.
     */
    public boolean involves(User user) {
        return this.user1.getId().equals(user.getId())
            || this.user2.getId().equals(user.getId());
    }

    /**
     * 상대방 유저를 반환합니다.
     */
    public User getCounterpart(User me) {
        return this.user1.getId().equals(me.getId()) ? this.user2 : this.user1;
    }
}
