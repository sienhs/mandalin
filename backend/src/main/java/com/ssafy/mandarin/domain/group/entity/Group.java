package com.ssafy.mandarin.domain.group.entity;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "groups")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_sheet_id")
    private GroupSheet groupSheet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id1")
    private User member1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id2")
    private User member2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id3")
    private User member3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inven_id")
    private UserBuilding inven;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public boolean isCreator(Long userId) {
        return this.creator.getId().equals(userId);
    }

    public boolean isMember(Long userId) {
        if (isCreator(userId)) return true;
        if (member1 != null && member1.getId().equals(userId)) return true;
        if (member2 != null && member2.getId().equals(userId)) return true;
        if (member3 != null && member3.getId().equals(userId)) return true;
        return false;
    }

    public boolean isFull() {
        return member1 != null && member2 != null && member3 != null;
    }

    public int getMemberSlotIndex(Long userId) {
        if (member1 != null && member1.getId().equals(userId)) return 1;
        if (member2 != null && member2.getId().equals(userId)) return 2;
        if (member3 != null && member3.getId().equals(userId)) return 3;
        return 0;
    }

    public int addMember(User user) {
        if (isMember(user.getId())) {
            return getMemberSlotIndex(user.getId());
        }
        if (member1 == null) {
            this.member1 = user;
            return 1;
        } else if (member2 == null) {
            this.member2 = user;
            return 2;
        } else if (member3 == null) {
            this.member3 = user;
            return 3;
        }
        return 0;
    }
}
