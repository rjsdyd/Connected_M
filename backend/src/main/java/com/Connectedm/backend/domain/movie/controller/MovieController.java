package com.Connectedm.backend.domain.movie.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    // ==========================================
    // 🖥️ 메인 페이지 전용 API
    // ==========================================

    // 1. [오늘의 추천작] 섹션
    @GetMapping("/today")
    public String getTodayRecommendations() {
        return "API 성공: 오늘의 추천작 영화 리스트 4개 반환 (TMDB 연동 예정)";
    }

    // 2. [리뷰 한줄평] 섹션
    @GetMapping("/reviews/recent")
    public String getRecentReviews() {
        return "API 성공: 최근 유저들이 남긴 베스트 한줄평 3개 반환";
    }

    // 3. [카테고리별 영화] 섹션 (액션, 로맨스, 공포, SF 등)
    @GetMapping("/category")
    public String getMoviesByCategory(@RequestParam String genre) {
        return "API 성공: '" + genre + "' 장르의 영화 리스트 8개 반환";
    }

    // ==========================================
    // 🔍 기타 영화 기능 API (기존 유지)
    // ==========================================

    @GetMapping("/popular")
    public String getPopularMovies(@RequestParam(defaultValue = "1") int page) {
        return "인기 영화 전체 목록 API (페이지: " + page + ")";
    }

    @GetMapping("/search")
    public String searchMovies(@RequestParam String query) {
        return "검색 결과 API: '" + query + "'";
    }

    @GetMapping("/{tmdbId}")
    public String getMovieDetails(@PathVariable Long tmdbId) {
        return "상세 정보 API: TMDB ID [" + tmdbId + "]";
    }
}