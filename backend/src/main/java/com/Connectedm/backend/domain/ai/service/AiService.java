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

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // 💡 [기획 2번] 가드레일 (System Prompt) - OOD 방어
    private static final String SYSTEM_PROMPT = 
            "너는 'Connected M'의 영화 추천 및 분석 전문 AI 챗봇이야.\n" +
            "너의 임무는 내가 제공하는 DB 데이터를 바탕으로 사용자에게 영화를 추천하고 리뷰를 분석해 주는 거야.\n" +
            "[절대 규칙]\n" +
            "1. 영화, 감독, 배우, 장르, 리뷰 등 '영화'와 관련된 질문에만 답변해.\n" +
            "2. 만약 사용자가 영화와 전혀 상관없는 질문을 하면 절대 대답하지 마.\n" +
            "3. 상관없는 질문이 들어오면 무조건 다음 멘트만 출력해: \"죄송합니다. 저는 영화 분석 전용 챗봇입니다. 영화나 리뷰에 대해 물어보시면 친절하게 답변해 드릴게요! 🎬\"";

    @Transactional
    public ChatResponse processChat(ChatRequest request, Long userId) {
        
        // 💡 [기획 1번] RAG 도입 (DB 검색 로직은 추후 Content 도메인 연결 시 여기에 구현!)
        String augmentedPrompt = request.getPrompt(); 

        // 💡 [기획 2번 & 1번] 프롬프트 조립 후 Gemini API 호출 (요리 완성)
        String aiReply = callGeminiApi(augmentedPrompt);

        // 💡 [기획 3번 & 4번] 채팅 데이터 저장 정책 (회원 vs 비회원)
        if (userId != null) {
            // 회원: DB 영구 저장 처리 (Entity 구조 활용)
            saveChatHistory(userId, request.getPrompt(), aiReply);
        } else {
            // 비회원: DB 접근 없이 건너뜀 (휘발성)
            log.info("비회원 유저이므로 대화 기록을 DB에 저장하지 않습니다.");
        }

        return new ChatResponse(aiReply);
    }

    private String callGeminiApi(String userMessage) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;
        //tring url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
       // String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", SYSTEM_PROMPT + "\n\n사용자 질문: " + userMessage)
                        ))
                )
        );

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 실제 호출
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // 응답 파싱
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            }
            return "AI 응답을 해석할 수 없습니다.";

        } catch (Exception e) {
            log.error("Gemini API 호출 중 상세 오류: {}", e.getMessage());
            return "죄송합니다. 현재 AI 서버와 연결이 불안정합니다. 😢";
        }
    }

    // 대화 내역 저장 메서드 (추후 프론트엔드에서 세션 ID를 넘겨받으면 더 정교하게 수정 가능)
    private void saveChatHistory(Long userId, String userMsg, String aiMsg) {
        User user = userRepository.findById(userId).orElseThrow();
        
        // 임시로 매번 새 방을 만들도록 처리 (나중에는 기존 방 ID를 받아와서 연결할 수 있습니다)
        ChatSession session = ChatSession.builder()
                .user(user)
                .sessionTitle(userMsg.substring(0, Math.min(userMsg.length(), 15)) + "...") // 질문 앞부분을 방 제목으로
                .build();
        chatSessionRepository.save(session);

        chatMessageRepository.save(ChatMessage.builder().chatSession(session).role("user").message(userMsg).build());
        chatMessageRepository.save(ChatMessage.builder().chatSession(session).role("assistant").message(aiMsg).build());
    }
}