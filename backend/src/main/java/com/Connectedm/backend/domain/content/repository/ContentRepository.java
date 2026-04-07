package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {
    // TMDB ID로 영화 찾는 기능
    Optional<Content> findByTmdbId(String tmdbId);

    // 씨네21 ID로 영화 찾는 기능
    Optional<Content> findByCine21Id(String cine21Id);
}
