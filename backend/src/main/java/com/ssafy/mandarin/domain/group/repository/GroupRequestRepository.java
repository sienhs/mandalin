package com.ssafy.mandarin.domain.group.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.mandarin.domain.group.entity.Group;
import com.ssafy.mandarin.domain.group.entity.GroupRequest;
import com.ssafy.mandarin.domain.group.entity.GroupRequestProgress;
import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRequestRepository extends JpaRepository<GroupRequest, Long> {

    Optional<GroupRequest> findByGroupAndReceiver(Group group, User receiver);

    Page<GroupRequest> findByReceiverAndProgressInOrderByCreatedAtDesc(
        User receiver,
        List<GroupRequestProgress> progressList,
        Pageable pageable
    );

    long countByReceiverAndProgress(User receiver, GroupRequestProgress progress);
}
