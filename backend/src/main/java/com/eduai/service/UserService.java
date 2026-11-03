package com.eduai.service;

import com.eduai.exception.EntityNotFoundException;
import com.eduai.model.dto.PasswordChangeRequest;
import com.eduai.model.dto.UserDto;
import com.eduai.model.entity.User;
import com.eduai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUserEntity(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public UserDto getUserProfile(String email) {
        return mapToDto(getCurrentUserEntity(email));
    }

    public UserDto updateProfile(String email, UserDto userDto) {
        User user = getCurrentUserEntity(email);
        user.setFullName(userDto.getFullName());
        user.setProfilePicUrl(userDto.getProfilePicUrl());
        return mapToDto(userRepository.save(user));
    }

    public void changePassword(String email, PasswordChangeRequest request) {
        User user = getCurrentUserEntity(email);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect old password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found width ID: " + id);
        }
        userRepository.deleteById(id);
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
