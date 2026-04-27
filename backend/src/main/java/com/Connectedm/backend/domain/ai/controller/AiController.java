package com.Connectedm.backend.domain.ai.controller;

import com.Connectedm.backend.domain.ai.dto.ChatRequest;
import com.Connectedm.backend.domain.ai.dto.ChatResponse;
import com.Connectedm.backend.domain.ai.service.AiService;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository; // 유저 정보 조회를 위해 유지하되 로직은 캡슐화

    /**
     * 1. 리뷰 3줄 요약 (DB 데이터 활용)
     */
    @GetMapping("/summary/{contentId}")
    public ResponseEntity<String> getReviewSummary(@PathVariable Long contentId) {
        // AiService에서 AnalysisCache의 summary 컬럼 데이터를 가져오도록 연결
        String summary = aiService.getMovieSummary(contentId);
        return ResponseEntity.ok(summary);
    }

    /**
     * 2. 리뷰 감성 지수 분석 (DB 데이터 활용)
     */
    @GetMapping("/sentiment/{contentId}")
    public ResponseEntity<Integer> getReviewSentiment(@PathVariable Long contentId) {
        // AiService에서 AnalysisCache의 positive_ratio 컬럼 데이터를 가져오도록 연결
        Integer sentiment = aiService.getMovieSentiment(contentId);
        return ResponseEntity.ok(sentiment);
    }

    /**
     * 3. 대화형 맞춤 영화 추천 (챗봇)
     */
    @PostMapping("/recommend")
    public ResponseEntity<ChatResponse> recommendMovie(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // 유저 ID 추출 로직을 별도 메서드로 분리하여 가독성 확보
        Long userId = resolveUserId(userDetails);

        ChatResponse response = aiService.processChat(request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. 영화 관련 키워드 추출 (DB 데이터 반환)
     */
    @GetMapping("/keywords/{contentId}")
    public ResponseEntity<List<String>> getMovieKeywords(@PathVariable Long contentId) {
        return ResponseEntity.ok(aiService.getMovieKeywords(contentId));
    }

    // --- 내부 헬퍼 메서드 ---

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails == null) return null;

        String loginInfo = userDetails.getUsername();
        return userRepository.findByEmail(loginInfo)
                .map(User::getId)
                .orElseGet(() -> userRepository.findByProviderId(loginInfo)
                        .map(User::getId)
                        .orElse(null));
    }
}