package com.Connectedm.backend.global.auth.handler;

import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.entity.User.AuthProvider; // ✨ Enum 임포트 확인
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.global.auth.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attributes = oAuth2User.getAttributes();

            // 1. 소셜 서비스 구분 (kakao, google 등)
            String registrationId = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();
            AuthProvider authProvider = AuthProvider.valueOf(registrationId.toUpperCase());

            // 2. 소셜 고유 ID 추출 (절대 바뀌지 않는 값)
            String providerId = attributes.get("id").toString();

            // 3. ✨ [핵심 수정] 이메일이 아닌 '지문(Provider + ID)'으로 유저 찾기
            // 사용자가 이메일을 수정했더라도 소셜 ID는 변하지 않으므로 로그인이 성공합니다.
            User user = userRepository.findByProviderAndProviderId(authProvider, providerId)
                    .orElseThrow(() -> new RuntimeException("해당 소셜 계정으로 가입된 유저를 찾을 수 없습니다."));

            // 4. 토큰 생성
            String accessToken = tokenProvider.createAccessToken(authentication);

            // 5. 리다이렉트 (현재 유저의 실제 최신 정보 전달)
            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("id", user.getId())
                    .queryParam("email", user.getEmail()) // 이제 lmjkakao@test.com 같은 최신 이메일이 전달됩니다.
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