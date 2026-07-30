package com.ssafy.mandarin.domain.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.user.dto.MyProfileResponse;
import com.ssafy.mandarin.domain.user.dto.PointResponse;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public MyProfileResponse getMyProfile(Long userId) {
        User user = findActiveUserById(userId);
        return MyProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public PointResponse getPoints(Long userId) {
        User user = findActiveUserById(userId);
        return PointResponse.of(user.getPoint());
    }

    /**
     * 카카오 ID(UUID)로 유저를 조회하여 존재하는 유저를 반환하고,
     * DB에 존재하지 않으면 신규 유저로 등록(추가)하여 반환합니다.
     */
    public User getOrCreateUser(String uuid, String name, String profileImage) {
        return userRepository.findByUuid(uuid)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .uuid(uuid)
                            .name(name != null ? name : "사용자")
                            .profileImage(profileImage)
                            .point(0)
                            .build();
                    log.info("New user registered: uuid={}, name={}", uuid, name);
                    return userRepository.save(newUser);
                });
    }

    public User getOrCreateUser(String uuid, String name) {
        return getOrCreateUser(uuid, name, null);
    }

    private User findActiveUserById(Long userId) {
        return userRepository.findById(userId)
                .filter(user -> !user.isWithdrawn())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
