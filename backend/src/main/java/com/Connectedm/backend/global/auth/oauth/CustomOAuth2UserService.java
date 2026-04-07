package com.Connectedm.backend.global.auth.oauth;

import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.entity.User.AuthProvider;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 소셜에서 기본 유저 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2. 어떤 소셜 로그인인지 확인 (kakao, google 등)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = null;
        AuthProvider authProvider = AuthProvider.LOCAL;

        if (registrationId.equals("kakao")) {
            oAuth2UserInfo = new KakaoUserInfo(oAuth2User.getAttributes());
            authProvider = AuthProvider.KAKAO;
        } else if (registrationId.equals("google")) {
            oAuth2UserInfo = new GoogleUserInfo(oAuth2User.getAttributes());
            authProvider = AuthProvider.GOOGLE;
        }

        if (oAuth2UserInfo == null) {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인입니다.");
        }

        // 3. 소셜에서 제공하는 고유 식별 데이터 추출
        String providerId = oAuth2UserInfo.getProviderId();
        String nickname = oAuth2UserInfo.getName();
        String email = oAuth2UserInfo.getEmail();

        // 4. 최초 가입 시 사용할 임시 이메일 생성
        if (email == null || email.isEmpty()) {
            email = registrationId + "_" + providerId + "@connectedm.temp";
        }

        final String finalEmail = email;
        final AuthProvider finalProvider = authProvider;
        final String finalNickname = (nickname != null) ? nickname : "소셜유저";

        // 5. [핵심 로직] 이메일이 아닌 '지문(Provider + ID)'으로 유저 식별
        userRepository.findByProviderAndProviderId(finalProvider, providerId)
                .map(entity -> {
                    // 기존 유저가 있다면 닉네임만 최신화 (이메일은 유지)
                    entity.setNickname(finalNickname);
                    return userRepository.save(entity);
                })
                .orElseGet(() -> {
                    // 처음 온 사람이라면 새로 가입
                    return userRepository.save(User.builder()
                            .email(finalEmail)
                            .nickname(finalNickname)
                            .realName(finalNickname)
                            // 암호화된 임시 비밀번호 설정 (nullable=false 대응)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .phoneNumber("010-0000-0000")
                            .provider(finalProvider)   // KAKAO 혹은 GOOGLE 저장
                            .providerId(providerId)    // 고유 번호 저장
                            .build());
                });

        return oAuth2User;
    }
}
