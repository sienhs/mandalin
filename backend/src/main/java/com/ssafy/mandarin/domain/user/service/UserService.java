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

    private User findActiveUserById(Long userId) {
        return userRepository.findById(userId)
            .filter(user -> !user.isWithdrawn())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
