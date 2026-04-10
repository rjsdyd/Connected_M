package com.Connectedm.backend.domain.user.service;

import com.Connectedm.backend.domain.user.dto.UserLoginRequest;
import com.Connectedm.backend.domain.user.dto.UserResponse;
import com.Connectedm.backend.domain.user.dto.UserSignupRequest;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.global.error.CustomException;
import com.Connectedm.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Transactional
    public Long signUp(UserSignupRequest request) {
        // 1. 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.ALREADY_REGISTERED_EMAIL);
        }

        // 2. 닉네임 중복 체크
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.ALREADY_USED_NICKNAME);
        }

        // 3. 전화번호 중복 체크 (010-1234-1234 중복 방지)
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new CustomException(ErrorCode.ALREADY_REGISTERED_PHONE);
        }

        // 4. 암호화 및 빌더로 저장
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .realName(request.getRealName())
                .phoneNumber(request.getPhoneNumber())
                .provider(User.AuthProvider.LOCAL)
                .build();

        return userRepository.save(user).getId();
    }

    @Transactional
    public void verifyAndSendResetLink(String email, String realName, String phoneNumber) {
        // DB에서 세 가지 정보가 모두 일치하는 유저가 있는지 확인
        User user = userRepository.findByEmailAndRealNameAndPhoneNumber(email, realName, phoneNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 일치하면 토큰 생성 후 메일 발송
        String resetToken = java.util.UUID.randomUUID().toString();
        mailService.sendResetLink(user.getEmail(), resetToken);
    }

    public UserResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
        return UserResponse.from(user);
    }

    // 3. 마이페이지 유저 정보 조회
    public UserResponse getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return UserResponse.from(user);
    }
}
