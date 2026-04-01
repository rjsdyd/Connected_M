package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.AnalysisCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisCacheRepository extends JpaRepository<AnalysisCache, Long> {
    // 특정 영화 ID로 분석 결과를 찾고 싶을 때
    Optional<AnalysisCache> findByContentId(Long contentId);
}
