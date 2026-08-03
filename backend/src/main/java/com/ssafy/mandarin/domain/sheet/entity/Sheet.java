package com.ssafy.mandarin.domain.sheet.entity;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.entity.BaseEntity;

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
@Table(name = "sheet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Sheet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(name = "is_open", nullable = false)
    @Builder.Default
    private Boolean isOpen = false;

    @Column(name = "like_count")
    @Builder.Default
    private Long likeCount = 0L;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    public void updateTitle(String title) {
        this.title = title;
    }

    /**
     * 공개 여부 변경.
     *
     * <p>만다라트 내용(제목·세부 목표·과제)과 달리 이건 언제든 바꿀 수 있다 —
     * 목표가 아니라 누구에게 보일지에 대한 설정이기 때문이다.
     * {@code updateTitle} 은 생성 흐름에서만 쓰고 수정 API 로는 열지 않는다.
     */
    public void updateIsOpen(Boolean isOpen) {
        this.isOpen = isOpen;
    }

    public void incrementLikeCount() {
        if (this.likeCount == null) {
            this.likeCount = 0L;
        }
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount != null && this.likeCount > 0) {
            this.likeCount--;
        }
    }
}
