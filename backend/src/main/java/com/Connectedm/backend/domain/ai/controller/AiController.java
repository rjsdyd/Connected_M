package com.Connectedm.backend.domain.ai.controller;

import com.Connectedm.backend.domain.ai.dto.ChatRequest;
import com.Connectedm.backend.domain.ai.dto.ChatResponse;
import com.Connectedm.backend.domain.ai.service.AiService;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository; // 유저 정보를 찾기 위해 추가

    // 1. 리뷰 3줄 요약 (Python + Gemini)
    @GetMapping("/summary/{tmdbId}")
    public String getReviewSummary(@PathVariable Long tmdbId) {
        return "AI 요약 API: TMDB ID [" + tmdbId + "]의 리뷰 3줄 요약 데이터 반환 (구현 예정)";
    }

    // 2. 리뷰 감성 지수 분석
    @GetMapping("/sentiment/{tmdbId}")
    public String getReviewSentiment(@PathVariable Long tmdbId) {
        return "AI 감성 분석 API: TMDB ID [" + tmdbId + "]의 긍정/부정 지수 반환 (구현 예정)";
    }

    // 3. 대화형 맞춤 영화 추천 (챗봇)
    @PostMapping("/recommend")
    public ChatResponse recommendMovie(@RequestBody ChatRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = null;

        if (userDetails != null) {
            String loginInfo = userDetails.getUsername(); // "4834407334" 또는 이메일이 들어옴

            // 1. 먼저 이메일로 찾아봅니다 (로컬 유저용)
            userId = userRepository.findByEmail(loginInfo)
                    .map(User::getId)
                    .orElseGet(() ->
                            // 2. 없으면 번호(providerId)로 다시 찾습니다 (카카오 유저용)
                            userRepository.findByProviderId(loginInfo)
                                    .map(User::getId)
                                    .orElse(null)
                    );
        }

        return aiService.processChat(request, userId);
    }
}