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

            // 1. 어떤 서비스(kakao, google)인지 확인
            OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
            String registrationId = authToken.getAuthorizedClientRegistrationId();
            AuthProvider authProvider = AuthProvider.valueOf(registrationId.toUpperCase());

            // 2. ✨ [핵심 수정] 서비스별로 다른 ID 키값 처리
            String providerId;
            if ("kakao".equals(registrationId)) {
                providerId = attributes.get("id").toString(); // 카카오는 'id'
            } else if ("google".equals(registrationId)) {
                providerId = attributes.get("sub").toString(); // 구글은 'sub'
            } else {
                throw new RuntimeException("지원하지 않는 소셜 서비스입니다: " + registrationId);
            }

            // 3. 지문(Provider + ID)으로 유저 찾기
            User user = userRepository.findByProviderAndProviderId(authProvider, providerId)
                    .orElseThrow(() -> new RuntimeException("해당 소셜 계정으로 가입된 유저를 찾을 수 없습니다."));

            // 4. 토큰 생성
            String accessToken = tokenProvider.createAccessToken(authentication);

            // 5. 리다이렉트 (최신 유저 정보 전달)
            boolean needInfo = user.getPhoneNumber() == null || user.getPhoneNumber().equals("010-0000-0000");

            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                    .queryParam("token", accessToken)
                    .queryParam("id", user.getId())
                    .queryParam("email", user.getEmail())
                    .queryParam("nickname", user.getNickname())
                    .queryParam("needInfo", needInfo) // ✨ 이 신호를 리액트에 보냅니다!
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