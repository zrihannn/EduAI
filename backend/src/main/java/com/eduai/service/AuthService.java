package com.eduai.service;

import com.eduai.exception.EntityNotFoundException;
import com.eduai.exception.ValidationException;
import com.eduai.model.dto.AuthResponse;
import com.eduai.model.dto.LoginRequest;
import com.eduai.model.dto.RegisterRequest;
import com.eduai.model.dto.UserDto;
import com.eduai.model.entity.User;
import com.eduai.repository.UserRepository;
import com.eduai.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email is already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isVerified(false)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Optional: Trigger email verification here

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        return generateAuthResponse(savedUser, authentication);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return generateAuthResponse(user, authentication);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new ValidationException("Invalid refresh token");
        }

        String username = tokenProvider.getUsernameFromJWT(refreshToken);

        // Check if token was invalidated in Redis
        if (Boolean.TRUE.equals(redisTemplate.hasKey("invalidated_refresh:" + refreshToken))) {
            throw new ValidationException("Refresh token was invalidated");
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, null); // Simplified for refresh

        String newAccessToken = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(mapToDto(user))
                .build();
    }

    public void logout(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            // Store invalid refresh token in Redis with TTL equal to its remaining
            // expiration
            redisTemplate.opsForValue().set("invalidated_refresh:" + refreshToken, "true", 7, TimeUnit.DAYS);
        }
    }

    private AuthResponse generateAuthResponse(User user, Authentication authentication) {
        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
                .user(mapToDto(user))
                .build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .profilePicUrl(user.getProfilePicUrl())
                .build();
    }
}
