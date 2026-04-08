package com.Connectedm.backend.domain.user.controller;

import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Connectedm.backend.domain.user.dto.UserLoginRequest;
import com.Connectedm.backend.domain.user.dto.UserResponse;
import com.Connectedm.backend.domain.user.dto.UserSignupRequest;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.domain.user.service.UserService;
import com.Connectedm.backend.global.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

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
    public ApiResponse<UserResponse> getMyPage(@PathVariable("userId") Long userId) {
        UserResponse response = userService.getUserInfo(userId);
        return ApiResponse.success(response);
    }

    @PutMapping("/update-extra-info")
    public ApiResponse<String> updateExtraInfo(@RequestBody Map<String, Object> request) {
        try {
            // 1. 데이터 추출 (null 체크 포함)
            if (request.get("id") == null) return ApiResponse.error("ID가 누락되었습니다.");

            Long id = Long.valueOf(request.get("id").toString());
            String email = (String) request.get("email");
            String phoneNumber = (String) request.get("phoneNumber");
            String password = (String) request.get("password");

            // 2. 유저 조회
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다. ID: " + id));

            // 3. 데이터 업데이트
            user.setEmail(email);
            user.setPhoneNumber(phoneNumber);
            if (password != null && !password.isEmpty()) {
                user.setPassword(passwordEncoder.encode(password));
            }

            userRepository.save(user);
            return ApiResponse.success("정보 업데이트 성공!");

        } catch (Exception e) {
            // ✨ 로그에 에러 원인을 찍어줍니다. (인텔리제이에서 확인 가능)
            e.printStackTrace();
            return ApiResponse.error("서버 내부 에러: " + e.getMessage());
        }
    }
}