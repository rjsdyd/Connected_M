package com.Connectedm.backend.domain.auth.controller;

import com.Connectedm.backend.domain.user.dto.*;
import com.Connectedm.backend.domain.user.service.UserService;
import com.Connectedm.backend.global.auth.JwtTokenProvider;
import com.Connectedm.backend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth") // 👈 "나 여기로 들어올래!" (인증 관련)
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest dto) {
        UserResponse userResponse = userService.login(dto);
        Authentication auth = new UsernamePasswordAuthenticationToken(userResponse.getEmail(), null, Collections.emptyList());
        String token = jwtTokenProvider.createAccessToken(auth);
        return ResponseEntity.ok(ApiResponse.success(new LoginResponse(token, userResponse)));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupRequest dto) {
        Long userId = userService.signUp(dto);
        UserResponse userResponse = userService.getUserInfo(userId);
        Authentication auth = new UsernamePasswordAuthenticationToken(userResponse.getEmail(), null, Collections.emptyList());
        String token = jwtTokenProvider.createAccessToken(auth);
        return ResponseEntity.ok(ApiResponse.success(new LoginResponse(token, userResponse)));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(
            @RequestParam String email,
            @RequestParam String realName,
            @RequestParam String phoneNumber
    ) {
        userService.verifyAndSendResetLink(email, realName, phoneNumber);

        return ResponseEntity.ok(ApiResponse.success("입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다."));
    }
}