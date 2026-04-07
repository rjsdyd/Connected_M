package com.Connectedm.backend.global.auth.handler;

import com.Connectedm.backend.domain.user.entity.User; // ✨ 1. 내 엔티티를 정확히 가져옴 (getId 해결)
import com.Connectedm.backend.domain.user.repository.UserRepository; // ✨ 2. 리포지토리 가져옴
import com.Connectedm.backend.global.auth.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor // ✨ 3. 이걸로 userRepository 주입 완료
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository; // ✨ 4. 변수 선언 (Cannot resolve symbol 해결)

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attributes = oAuth2User.getAttributes();

            // 카카오 고유번호 추출 (예: 4834407334)
            String kakaoId = attributes.get("id").toString();

            // ✨ 명준님 DB에 들어있는 "임시 이메일" 형식 만들기
            String tempEmail = "kakao_" + kakaoId + "@connectedm.temp";

            // ✨ DB에서 진짜 유저(PK 3번 같은 녀석) 찾기
            User user = userRepository.findByEmail(tempEmail)
                    .orElseThrow(() -> new RuntimeException("임시 계정을 찾을 수 없습니다: " + tempEmail));

            // 토큰 생성
            String accessToken = tokenProvider.createAccessToken(authentication);

            // 5. 리다이렉트 (진짜 ID, 임시 이메일, 닉네임 전송)
            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("id", user.getId())       // 이제 빨간줄 안 뜰 겁니다!
                    .queryParam("email", user.getEmail()) // App.tsx에서 kakao_ 체크용
                    .queryParam("nickname", user.getNickname())
                    .build()
                    .encode(StandardCharsets.UTF_8)
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            log.error("소셜 로그인 핸들러 실패!", e);
            response.sendRedirect("http://localhost:5173/?error=auth_failed");
        }
    }
}