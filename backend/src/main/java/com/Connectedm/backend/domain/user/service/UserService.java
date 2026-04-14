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

import java.time.LocalDateTime;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
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
        // 전화번호를 DB 저장 형식(010-0000-0000)으로 통일
        String normalizedPhone = normalizePhoneNumber(phoneNumber);
        log.info("비밀번호 재설정 요청: email={}, realName={}, originalPhone={}, normalizedPhone={}", email, realName, phoneNumber, normalizedPhone);

        // DB에서 이메일+이름+전화번호가 일치하는지 확인
        User user = userRepository.findByEmailAndRealNameAndPhoneNumber(email, realName, normalizedPhone)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 비밀번호 재설정 토큰을 생성하여 DB에 저장하고, 이메일로 링크 전송
        String resetToken = java.util.UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        mailService.sendResetLink(user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 이메일 링크의 토큰으로 유저 조회
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_PASSWORD_RESET_TOKEN));

        if (user.getPasswordResetTokenExpiry() == null || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.EXPIRED_PASSWORD_RESET_TOKEN);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        String digits = phoneNumber.replaceAll("[^0-9]", "");
        if (digits.length() == 11) {
            return digits.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
        } else if (digits.length() == 10) {
            return digits.replaceFirst("(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3");
        }
        return phoneNumber;
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
