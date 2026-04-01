package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.ExpertReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpertReviewRepository extends JpaRepository<ExpertReview, Long> {
    // 특정 영화의 전문가 리뷰들만 긁어올 때
    List<ExpertReview> findByContentId(Long contentId);
}
