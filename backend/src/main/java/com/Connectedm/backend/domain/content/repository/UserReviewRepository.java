package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.UserReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserReviewRepository extends JpaRepository<UserReview, Long> {

    // 특정 영화의 유저 리뷰들을 최신순으로 가져오기
    List<UserReview> findByContentId(Long contentId);

    // 특정 유저가 쓴 리뷰들만 모아보기 - 마이페이지용
    List<UserReview> findByUserId(Long userId);

    // 특정유저가 쓴 리뷰의 갯수
    Long countByUserId(Long userId);

    // [핵심 추가] 1인 1영화 1리뷰 검증용
    boolean existsByUserIdAndContentId(Long userId, Long contentId);

    List<UserReview> findAllByReportCountGreaterThanOrderByReportCountDesc(int count);
}
