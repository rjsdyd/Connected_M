package com.Connectedm.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())        // CSRF 보호 비활성화 (테스트용)
                .formLogin(form -> form.disable())   // 🚨 Spring Security 기본 로그인 화면 끄기 (강제 이동 방지)
                .httpBasic(basic -> basic.disable()) // HTTP 기본 인증 끄기
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()        // 모든 요청에 대해 자물쇠 풀기!
                );
        return http.build();
    }
}