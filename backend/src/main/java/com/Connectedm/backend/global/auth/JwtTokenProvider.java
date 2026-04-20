package com.Connectedm.backend.global.auth;

import com.Connectedm.backend.domain.user.repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpirationTime;
    private final UserRepository userRepository;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.expiration}") long expirationTime,
            UserRepository userRepository) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationTime = expirationTime;
        this.userRepository = userRepository;
    }

    // 1. 액세스 토큰 생성
    public String createAccessToken(Authentication authentication) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationTime);

        return Jwts.builder()
                .setSubject(authentication.getName())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✨ 2. [추가] 토큰에서 인증 정보(Authentication) 가져오기
    // JwtAuthenticationFilter가 이 메서드를 호출해서 "이 토큰 누구꺼야?"라고 물어봅니다.
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String subject = claims.getSubject(); // "이메일" 혹은 "카카오고유번호"

        // 💡 [핵심] 이메일로 찾아보고, 없으면 providerId로 다시 한 번 찾습니다.
        Long userId = userRepository.findByEmail(subject) // 1. 이메일 탐색
                .map(com.Connectedm.backend.domain.user.entity.User::getId)
                .orElseGet(() -> userRepository.findByProviderId(subject) // 2. 없으면 카카오ID 탐색
                        .map(com.Connectedm.backend.domain.user.entity.User::getId)
                        .orElseThrow(() -> new RuntimeException("사용자 '" + subject + "'를 찾을 수 없습니다.")));

        return new UsernamePasswordAuthenticationToken(userId, token, Collections.emptyList());
    }

    // 3. 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.error("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    // 4. 토큰에서 유저 정보 추출 (기존 getPayload)
    public String getPayload(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }


}