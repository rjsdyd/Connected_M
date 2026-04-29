package com.Connectedm.backend.domain.admin.dto;

import com.Connectedm.backend.domain.user.entity.UserRole;
import com.Connectedm.backend.domain.user.entity.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private String realName;
    private String phoneNumber;
    private UserRole role;
    private UserStatus status;
    private int reportedCount;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
