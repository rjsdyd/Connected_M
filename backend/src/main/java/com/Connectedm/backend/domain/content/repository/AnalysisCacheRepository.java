package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.AnalysisCache;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface AnalysisCacheRepository extends JpaRepository<AnalysisCache, Long> {
    Optional<AnalysisCache> findByContentId(Long contentId);

    List<AnalysisCache> findAllByContentIdIn(List<Long> contentIds);
}