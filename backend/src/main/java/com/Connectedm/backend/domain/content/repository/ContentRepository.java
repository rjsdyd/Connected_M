package com.Connectedm.backend.domain.content.repository;

import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {
    // TMDB ID로 영화찾는 기능
    Optional<Content> findByTmdbId(String tmdbId);


}
