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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    @Column(nullable = false)
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

    public void incrementTryCount() {
        if (this.tryCount == null) {
            this.tryCount = 0;
        }
        this.tryCount++;
    }
}
