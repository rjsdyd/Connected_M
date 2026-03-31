package com.Connectedm.backend.domain.ai.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    // 1. 리뷰 3줄 요약 (Python + Gemini)
    @GetMapping("/summary/{tmdbId}")
    public String getReviewSummary(@PathVariable Long tmdbId) {
        return "AI 요약 API: TMDB ID [" + tmdbId + "]의 리뷰 3줄 요약 데이터 반환";
    }

    // 2. 리뷰 감성 지수 분석
    @GetMapping("/sentiment/{tmdbId}")
    public String getReviewSentiment(@PathVariable Long tmdbId) {
        return "AI 감성 분석 API: TMDB ID [" + tmdbId + "]의 긍정/부정 지수 반환";
    }

    // 3. 대화형 맞춤 영화 추천 (챗봇)
    @PostMapping("/recommend")
    public String recommendMovie(@RequestBody String prompt) {
        return "AI 추천 API: 사용자 프롬프트 [" + prompt + "] 기반 영화 추천 결과 반환";
    }
}