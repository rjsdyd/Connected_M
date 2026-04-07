package com.Connectedm.backend.domain.user.repository;

import com.Connectedm.backend.domain.user.entity.User;
// ✨ 핵심: User 클래스 '내부'에 있는 AuthProvider를 쓰겠다고 명시해야 합니다.
import com.Connectedm.backend.domain.user.entity.User.AuthProvider;
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

    // 3. 소셜 로그인 유저 식별용 (지문 확인)
    // 위에서 import를 정확히 해줬기 때문에 이제 에러가 나지 않습니다.
    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);
}