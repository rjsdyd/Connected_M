package com.Connectedm.backend.domain.user.repository;

import com.Connectedm.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인 시 이메일로 사용자를 찾기 위한 메서드
    Optional<User> findByEmail(String email);

    // 중복 가입 방지 체크
    boolean existsByEmail(String email);

    // 닉네임 중복 체크도 필요
    boolean existsByNickname(String nickname);
}
