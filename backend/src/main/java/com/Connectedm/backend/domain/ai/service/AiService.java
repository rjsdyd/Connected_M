package com.Connectedm.backend.domain.ai.service;

import com.Connectedm.backend.domain.ai.dto.ChatRequest;
import com.Connectedm.backend.domain.ai.dto.ChatResponse;
import com.Connectedm.backend.domain.ai.entity.ChatMessage;
import com.Connectedm.backend.domain.ai.entity.ChatSession;
import com.Connectedm.backend.domain.ai.repository.ChatMessageRepository;
import com.Connectedm.backend.domain.ai.repository.ChatSessionRepository;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    // ✅ application.properties에서 주소를 읽어옵니다.
    @Value("${external-api.python-ai-url}")
    private String pythonAiUrl;

    @Transactional
    public ChatResponse processChat(ChatRequest request, Long userId) {
        // 1. 세션 조회/생성
        ChatSession session = getOrCreateSession(request.getSessionId(), userId, request.getPrompt());

        // 2. 파이썬 서버 호출 (설정파일의 URL 사용)
        String aiReply = callPythonAiServer(request.getPrompt(), session.getId(), userId);

        // 3. 기록 저장 (회원 전용)
        if (userId != null) {
            saveChatMessage(session, request.getPrompt(), aiReply);
        }

        return new ChatResponse(aiReply);
    }

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

            // pythonAiUrl 변수 사용
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonAiUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("answer");
            }
            return "AI 서버 응답 오류입니다.";
        } catch (Exception e) {
            log.error("파이썬 서버(8888) 연결 실패: {}", e.getMessage());
            return "현재 영화 비서가 잠시 자리를 비웠습니다. 잠시 후 다시 시도해 주세요! 🎬";
        }
    }

    private ChatSession getOrCreateSession(Long sessionId, Long userId, String prompt) {
        if (sessionId != null) {
            return chatSessionRepository.findById(sessionId)
                    .orElseGet(() -> createNewSession(userId, prompt));
        }
        return createNewSession(userId, prompt);
    }

    private ChatSession createNewSession(Long userId, String prompt) {
        User user = userRepository.findById(userId).orElseThrow();
        ChatSession session = ChatSession.builder()
                .user(user)
                .sessionTitle(prompt.substring(0, Math.min(prompt.length(), 15)) + "...")
                .build();
        return chatSessionRepository.save(session);
    }

    private void saveChatMessage(ChatSession session, String userMsg, String aiMsg) {
        chatMessageRepository.save(ChatMessage.builder().chatSession(session).role("user").message(userMsg).build());
        chatMessageRepository.save(ChatMessage.builder().chatSession(session).role("assistant").message(aiMsg).build());
    }
}