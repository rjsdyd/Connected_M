package com.Connectedm.backend.domain.admin.dto;

import com.Connectedm.backend.domain.user.entity.UserStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminUserResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private int reportedCount;
    private UserStatus status;
}
