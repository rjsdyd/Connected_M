package com.Connectedm.backend.domain.user.repository;

import com.Connectedm.backend.domain.user.entity.AuthProvider; // ✨ 경로에 맞게 임포트!
import com.Connectedm.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 1. 일반 로그인/이메일 중복 체크용
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // 2. 닉네임 중복 체크
    boolean existsByNickname(String nickname);


     // 3. 소셜 로그인 유저 식별용 (지문 확인) ✨
    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);
}