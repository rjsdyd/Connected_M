package com.Connectedm.backend.domain.content.controller;

import com.Connectedm.backend.domain.content.dto.MovieMainDto;
import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.entity.Genre;
import com.Connectedm.backend.domain.content.repository.ContentRepository;
import com.Connectedm.backend.domain.content.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainController {

    private final ContentRepository contentRepository;
    private final GenreRepository genreRepository;

    // 1. 장르 목록 (카테고리)
    @GetMapping("/genres")
    public ResponseEntity<List<Genre>> getGenres() {
        return ResponseEntity.ok(genreRepository.findAll());
    }

    // 2. 오늘의 추천작 10개
    @GetMapping("/today")
    public ResponseEntity<List<MovieMainDto>> getTodayMovies() {
        List<Content> contents = contentRepository.findTop10OrderByIdDesc();

    }
}
