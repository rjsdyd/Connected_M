package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {
    // TMDB ID로 영화 찾는 기능
    Optional<Content> findByTmdbId(String tmdbId);

    // 영화 상세 조회 시 AI분석캐시를 한번에 가져오는 기능
    @Query("SELECT c From Content c LEFT JOIN FETCH c.analysisCache WHERE c.id = :id")
    Optional<Content> findWithCacheById(@Param("id") Long id);

}
