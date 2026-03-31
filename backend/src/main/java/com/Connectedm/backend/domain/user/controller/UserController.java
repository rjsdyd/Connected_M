package com.Connectedm.backend.domain.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users") // user 관련 API는 이 주소로 시작하도록 통일
public class UserController {

    // 임시 로그인 화면 확인용 (GET)
    @GetMapping("/login")
    public String loginPage() {
        return "여기는 Connected M 로그인 API 주소입니다. (React에서 이 주소로 데이터를 보내주세요!)";
    }

    // 임시 로그인 처리 로직 (POST)
    @PostMapping("/login")
    public String loginProcess(@RequestParam String email, @RequestParam String password) {
        System.out.println("프론트엔드에서 넘어온 이메일: " + email);

        // 임시 테스트용 조건문
        if ("test@test.com".equals(email) && "1234".equals(password)) {
            return "SUCCESS: 로그인 성공!";
        } else {
            return "FAIL: 이메일 또는 비밀번호가 틀렸습니다.";
        }
    }
}