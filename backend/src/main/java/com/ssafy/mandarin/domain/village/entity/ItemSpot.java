package com.ssafy.mandarin.domain.village.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.ssafy.mandarin.domain.sheet.entity.Sheet;

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

@Entity
@Table(name = "item_spot")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class ItemSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inven_id")
    private Long invenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sheet_id", nullable = false)
    private Sheet sheet;

    // 어느 타일인지 없는 배치 칸은 성립하지 않는다. V6 의 CHECK 로 1~9 범위까지 강제된다.
    @Column(name = "domain_position", nullable = false)
    private Integer domainPosition;

    @Column(name = "item_position", nullable = false)
    private Integer itemPosition;

    // 회전값은 없을 수 없다 — 회전하지 않은 상태가 DEG_0 이다. 빌더 기본값이 DEG_0 이지만
    // .dir(null) 로 명시하면 기본값이 덮이므로 prePersist 에서 한 번 더 막는다.
    @Enumerated(EnumType.STRING)
    @Column(name = "dir", nullable = false, length = 10)
    @Builder.Default
    private ItemDir dir = ItemDir.DEG_0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        }
        if (this.dir == null) {
            this.dir = ItemDir.DEG_0;
        }
    }

    public void updateSpot(Long invenId, Integer domainPosition, Integer itemPosition, ItemDir dir) {
        this.invenId = invenId;
        this.domainPosition = domainPosition;
        this.itemPosition = itemPosition;
        this.dir = dir != null ? dir : ItemDir.DEG_0;
    }
}
