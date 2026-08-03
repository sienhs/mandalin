package com.ssafy.mandarin.domain.subject.entity;

import com.ssafy.mandarin.domain.sheet.entity.Domain;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "subject")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Subject extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name="period_type",nullable = false)
    private SubjectPeriod period;

    @Column(nullable = false)
    @Builder.Default
    private Long point = 0L;

    @Column(name = "target_count")
    private Integer targetCount;

    @Column(name = "try_count")
    @Builder.Default
    private Integer tryCount = 0;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "is_done", nullable = false)
    @Builder.Default
    private Boolean isDone = false;

    public void updateIsDone(Boolean isDone) {
        this.isDone = isDone;
    }

    /** 수행 횟수를 직접 지정한다. 음수는 0 으로 눌러 진행률이 음수가 되지 않게 한다. */
    public void updateTryCount(Integer tryCount) {
        this.tryCount = tryCount == null || tryCount < 0 ? 0 : tryCount;
    }

    public void incrementTryCount() {
        if (this.tryCount == null) {
            this.tryCount = 0;
        }
        this.tryCount++;
    }

    @PrePersist
    public void prePersist() {
        // 엔티티가 처음 저장될 때, updatedAt을 하루 전으로 초기화
        if (getUpdatedAt() == null || getUpdatedAt().isAfter(LocalDateTime.now().minusHours(1))) {
            initUpdatedAt(LocalDateTime.now().minusDays(1));
        }
    }
}
