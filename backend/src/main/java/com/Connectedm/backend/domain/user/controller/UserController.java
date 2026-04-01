package com.Connectedm.backend.domain.user.controller;

import com.Connectedm.backend.domain.user.dto.UserLoginRequest;
import com.Connectedm.backend.domain.user.dto.UserResponse;
import com.Connectedm.backend.domain.user.dto.UserSignupRequest;
import com.Connectedm.backend.domain.user.service.UserService;
import com.Connectedm.backend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 1. 신규 회원가입
    @PostMapping("/signup")
    public ApiResponse<Long> signUp(@RequestBody UserSignupRequest request) {
        Long userId = userService.signUp(request);
        return ApiResponse.success(userId);
    }

    // 2. 로그인 및 JWT 발급 준비
    @PostMapping("/login")
    public ApiResponse<UserResponse> login(@RequestBody UserLoginRequest request) {
        UserResponse response = userService.login(request);
        return ApiResponse.success(response);
    }

    // 3. 마이페이지 정보 조회 API
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getMyPage(@PathVariable Long userId) {
        UserResponse response = userService.getUserInfo(userId);
        return ApiResponse.success(response);
    }
}