package com.Connectedm.backend.domain.ai.service;

import com.Connectedm.backend.domain.ai.dto.ChatRequest;
import com.Connectedm.backend.domain.ai.dto.ChatResponse;
import com.Connectedm.backend.domain.ai.entity.ChatMessage;
import com.Connectedm.backend.domain.ai.entity.ChatSession;
import com.Connectedm.backend.domain.ai.repository.ChatMessageRepository;
import com.Connectedm.backend.domain.ai.repository.ChatSessionRepository;
import com.Connectedm.backend.domain.content.entity.AnalysisCache;
import com.Connectedm.backend.domain.content.repository.AnalysisCacheRepository;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final AnalysisCacheRepository analysisCacheRepository;

    @Value("${external-api.python-ai-url}")
    private String pythonAiUrl;

    private static final int SESSION_TITLE_MAX_LENGTH = 15;
    private static final String DEFAULT_ERROR_MSG = "현재 영화 비서가 잠시 자리를 비웠습니다. 잠시 후 다시 시도해 주세요! 🎬";

    /**
     * 챗봇 메인 로직
     */
    @Transactional
    public ChatResponse processChat(ChatRequest request, Long userId) {
        log.info(">>>> 챗봇 서비스 진입! 유저 ID: {}, 세션 ID: {}", userId, request.getSessionId());

        // 1. 세션 조회 또는 생성
        ChatSession session = getOrCreateSession(request.getSessionId(), userId, request.getPrompt());

        // 2. 파이썬 FastAPI 서버 호출
        String aiReply = callPythonAiServer(request.getPrompt(), session.getId(), userId);

        // 3. 채팅 기록 저장 (로그인 유저인 경우만)
        if (userId != null) {
            saveChatMessage(session, request.getPrompt(), aiReply);
        }

        return new ChatResponse(aiReply);
    }

    /**
     * FastAPI 서버 통신
     */
    private String callPythonAiServer(String prompt, Long sessionId, Long userId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> requestBody = Map.of(
                    "user_id", userId != null ? userId : 0,
                    "session_id", sessionId,
                    "prompt", prompt
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(pythonAiUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().getOrDefault("answer", "응답을 해석할 수 없습니다.");
            }
            return "AI 서버 응답 오류가 발생했습니다.";
        } catch (Exception e) {
            log.error(">>>> [FastAPI 연동 실패] : {}", e.getMessage());
            return DEFAULT_ERROR_MSG;
        }
    }

    /**
     * 영화별 탑 키워드 조회 (DB 기반)
     */
    @Transactional(readOnly = true)
    public List<String> getMovieKeywords(Long contentId) {
        return analysisCacheRepository.findByContentId(contentId)
                .map(this::parseKeywords)
                .orElse(List.of("데이터 준비 중"));
    }

    /**
     * 영화 3줄 요약 조회 (DB 기반)
     */
    @Transactional(readOnly = true)
    public String getMovieSummary(Long contentId) {
        return analysisCacheRepository.findByContentId(contentId)
                .map(AnalysisCache::getSummary)
                .filter(s -> !s.isBlank())
                .orElse("해당 영화의 AI 요약 정보가 아직 없습니다.");
    }

    /**
     * 영화 긍정 지수 조회 (DB 기반)
     */
    @Transactional(readOnly = true)
    public Integer getMovieSentiment(Long contentId) {
        return analysisCacheRepository.findByContentId(contentId)
                .map(cache -> (int) cache.getPositiveRatio()) // double -> int 형변환
                .orElse(0);
    }

    // --- Helper Methods ---

    private List<String> parseKeywords(AnalysisCache cache) {
        String keywords = cache.getTopKeywords();
        if (keywords == null || keywords.isBlank()) return Collections.emptyList();

        return Arrays.stream(keywords.split(","))
                .map(String::trim)
                .filter(word -> !word.isEmpty())
                .toList();
    }

    private ChatSession getOrCreateSession(Long sessionId, Long userId, String prompt) {
        if (sessionId != null) {
            return chatSessionRepository.findById(sessionId)
                    .orElseGet(() -> createNewSession(userId, prompt));
        }
        return createNewSession(userId, prompt);
    }

    private ChatSession createNewSession(Long userId, String prompt) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요한 서비스입니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("유저를 찾을 수 없습니다. ID: " + userId));

        String title = prompt.length() > SESSION_TITLE_MAX_LENGTH
                ? prompt.substring(0, SESSION_TITLE_MAX_LENGTH) + "..."
                : prompt;

        return chatSessionRepository.save(ChatSession.builder()
                .user(user)
                .sessionTitle(title)
                .build());
    }

    private void saveChatMessage(ChatSession session, String userMsg, String aiMsg) {
        chatMessageRepository.save(ChatMessage.builder().chatSession(session).role("user").message(userMsg).build());
        chatMessageRepository.save(ChatMessage.builder().chatSession(session).role("assistant").message(aiMsg).build());
    }
}