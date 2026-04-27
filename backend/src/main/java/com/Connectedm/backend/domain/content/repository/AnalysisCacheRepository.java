package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.AnalysisCache;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AnalysisCacheRepository extends JpaRepository<AnalysisCache, Long> {
    Optional<AnalysisCache> findByContentId(Long contentId);
}