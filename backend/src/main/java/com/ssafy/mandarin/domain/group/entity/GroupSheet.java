package com.ssafy.mandarin.domain.group.entity;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.ssafy.mandarin.domain.sheet.entity.Domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "group_sheet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class GroupSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id1")
    private Domain domain1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id2")
    private Domain domain2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id3")
    private Domain domain3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id4")
    private Domain domain4;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id5")
    private Domain domain5;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id6")
    private Domain domain6;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id7")
    private Domain domain7;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id8")
    private Domain domain8;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        }
    }

    public void mapCreatorDomains(Domain d1, Domain d2) {
        this.domain1 = d1;
        this.domain2 = d2;
    }

    public void mapMemberDomains(int slotIndex, Domain d1, Domain d2) {
        if (slotIndex == 1) {
            this.domain3 = d1;
            this.domain4 = d2;
        } else if (slotIndex == 2) {
            this.domain5 = d1;
            this.domain6 = d2;
        } else if (slotIndex == 3) {
            this.domain7 = d1;
            this.domain8 = d2;
        }
    }
}
