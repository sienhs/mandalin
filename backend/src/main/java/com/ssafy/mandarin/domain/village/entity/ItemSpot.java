package com.ssafy.mandarin.domain.village.entity;

import java.time.LocalDateTime;

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

    @Column(name = "domain_position")
    private Integer domainPosition;

    @Column(name = "item_position")
    private Integer itemPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "dir")
    @Builder.Default
    private ItemDir dir = ItemDir.DEG_0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public void updateSpot(Long invenId, Integer domainPosition, Integer itemPosition, ItemDir dir) {
        this.invenId = invenId;
        this.domainPosition = domainPosition;
        this.itemPosition = itemPosition;
        this.dir = dir != null ? dir : ItemDir.DEG_0;
    }
}
