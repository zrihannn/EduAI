package com.eduai.model.dto;

import com.eduai.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID id;
    private String fullName;
    private String email;
    private UserRole role;
    private String profilePicUrl;
}
