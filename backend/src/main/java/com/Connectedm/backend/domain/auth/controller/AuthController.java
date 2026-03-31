package com.Connectedm.backend.domain.auth.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 1. 신규 회원가입
    @PostMapping("/signup")
    public String signup(@RequestParam String email, @RequestParam String password, @RequestParam String nick) {
        return "회원가입 API: [" + nick + "]님 가입 완료 (Spring Security 연동 예정)";
    }

    // 2. 로그인 및 JWT 토큰 발급
    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password) {
        return "로그인 API: [" + email + "] 로그인 성공. JWT 토큰 발급 예정!";
    }
}