package com.Connectedm.backend.domain.user.repository;

import com.Connectedm.backend.domain.user.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // 유저아이디로 찜 갯수 확인
    long countByUserId(Long userId);
}
