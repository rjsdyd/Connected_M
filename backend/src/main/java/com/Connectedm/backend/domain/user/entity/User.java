package com.Connectedm.backend.domain.user.entity;

import com.Connectedm.backend.domain.content.entity.UserReview;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    // 이름 추가
    //@Column(nullable = false, length = 50)
    @Column(name = "real_name", nullable = false, length = 50)
    private String realName;

    // 전화번호 추가
    //@Column(length = 20)
    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 50)
    private String nickname;

    @CreationTimestamp
    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // UserReview와 관계 연결
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserReview> reviews = new ArrayList<>();

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private AuthProvider provider = AuthProvider.LOCAL; // LOCAL, KAKAO, GOOGLE 중 하나 기본값은 LOCAL

    @Column(name = "provider_id")
    private String providerId; // 소셜에서 주는 고유 번호 (일반 유저는 null)

    // Enum을 만들어서 관리하면 오타 실수를 줄일 수 있어요!
    public enum AuthProvider {
        LOCAL, KAKAO, GOOGLE
    }

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
