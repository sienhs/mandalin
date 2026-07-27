package com.ssafy.mandarin.domain.auth.service;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

	private final UserRepository userRepository;


	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String uuid) throws UsernameNotFoundException {
		return userRepository.findByUuid(uuid)
				.filter(user -> !user.isWithdrawn())
				.map(CustomUserDetails::new)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + uuid));
	}
}
