package com.Connectedm.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    // 이름 추가
    @Column(nullable = false, length = 50)
    private String realName;

    // 전화번호 추가
    @Column(length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 50)
    private String nickname;

    @CreationTimestamp
    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // DB 저장되기 직전에 번호 형식 바꿔주는 로직
    @PrePersist
    @PreUpdate
    public void formatPhoneNumber() {
        if (this.phoneNumber != null) {
            // 숫자만 남기기
            String digits = this.phoneNumber.replaceAll("[^0-9]", "");

            // 10~11자리 숫자에 대해 하이픈 적용
            if (digits.length() == 11) {
                this.phoneNumber = digits.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
            } else if (digits.length() == 10) {
                this.phoneNumber = digits.replaceFirst("(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3");
            }
        }
    }
}
