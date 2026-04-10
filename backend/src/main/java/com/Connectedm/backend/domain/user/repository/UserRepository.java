package com.Connectedm.backend.domain.user.repository;

import com.Connectedm.backend.domain.user.entity.User;
// User 엔티티 내부에 선언된 AuthProvider(LOCAL, KAKAO, GOOGLE)를 가져옵니다.
import com.Connectedm.backend.domain.user.entity.User.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ==========================================================
    // 1. 회원가입 및 로그인용 (중복 체크)
    // ==========================================================

    // 이메일로 유저 찾기 (로그인 시 사용)
    Optional<User> findByEmail(String email);

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 전화번호 중복 확인 (회원가입 시 010-1234-1234 중복 방지용)
    boolean existsByPhoneNumber(String phoneNumber);


    // ==========================================================
    // 2. 비밀번호 찾기 (본인 인증용)
    // ==========================================================

    // 이메일 + 실명 + 전화번호가 모두 일치하는 유저 찾기 (3중 검증)
    Optional<User> findByEmailAndRealNameAndPhoneNumber(String email, String realName, String phoneNumber);

    // ==========================================================
    // 3. 소셜 로그인용 (카카오, 구글)
    // ==========================================================

    // 소셜 서비스 공급자(provider)와 해당 서비스의 고유 ID(providerId)로 유저 찾기
    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);
}