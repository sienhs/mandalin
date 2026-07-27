package com.ssafy.mandarin.domain.auth.security;

import java.util.Collection;
import java.util.List;

import com.ssafy.mandarin.domain.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


/**
 * User 엔티티를 Spring Security 인증 주체로 노출하는 어댑터.
 */
public class CustomUserDetails implements UserDetails {

    private static final String DEFAULT_ROLE = "ROLE_USER";

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public Long getUserId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(DEFAULT_ROLE));
    }

    /**
     * 소셜 로그인 전용이라 저장된 비밀번호가 없다. formLogin/httpBasic 이 모두 비활성이라
     * 이 값이 비교에 쓰이는 경로는 없지만, UserDetails 계약상 null 은 허용되지 않는다.
     */
    @Override
    public String getPassword() {
        return "";
    }

    /** 인증 식별자는 uuid. JWT subject 와 동일하다. */
    @Override
    public String getUsername() {
        return user.getUuid();
    }

    @Override
    public boolean isAccountNonExpired() {
        return !user.isWithdrawn();
    }

    @Override
    public boolean isAccountNonLocked() {
        return !user.isWithdrawn();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !user.isWithdrawn();
    }
}