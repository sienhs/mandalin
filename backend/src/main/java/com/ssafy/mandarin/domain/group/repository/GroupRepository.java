package com.ssafy.mandarin.domain.group.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.mandarin.domain.group.entity.Group;
import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT g FROM Group g WHERE g.creator = :user OR g.member1 = :user OR g.member2 = :user OR g.member3 = :user ORDER BY g.createdAt DESC")
    List<Group> findAllMyGroups(@Param("user") User user);

    @Query("SELECT g FROM Group g LEFT JOIN FETCH g.groupSheet WHERE g.id = :groupId")
    Optional<Group> findByIdWithGroupSheet(@Param("groupId") Long groupId);
}
