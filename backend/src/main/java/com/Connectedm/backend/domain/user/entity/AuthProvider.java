package com.Connectedm.backend.domain.user.entity;

/**
 * 서비스에서 허용하는 인증 제공자 목록입니다.
 * Enum을 사용하면 KAKAO를 KAKO로 쓰는 오타 실수를 컴파일 시점에 잡아낼 수 있습니다.
 */
public enum AuthProvider {
    LOCAL, KAKAO, GOOGLE
}