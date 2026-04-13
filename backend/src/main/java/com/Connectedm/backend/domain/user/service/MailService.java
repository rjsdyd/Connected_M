package com.Connectedm.backend.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    // ✨ UserService에서 호출하는 바로 그 메서드입니다!
    // 파라미터로 이메일(String)과 토큰(String) 두 개를 받습니다.
    public void sendResetLink(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setFrom("Connected M <dlaudwns0903@gmail.com>"); // 보내는 사람
        message.setSubject("[Connected M] 비밀번호 재설정 안내");

        // 사용자가 클릭할 링크 (프론트엔드 주소)
        String resetUrl = "http://localhost:5173/reset-password?token=" + token; // 발급된 토큰을 URL 쿼리로 전달

        message.setText("안녕하세요. Connected M입니다.\n\n" +
                "비밀번호 재설정을 위해 아래 링크를 클릭해 주세요.\n" +
                resetUrl + "\n\n" +
                "이 링크는 30분 동안만 유효합니다.");

        mailSender.send(message);
    }
}