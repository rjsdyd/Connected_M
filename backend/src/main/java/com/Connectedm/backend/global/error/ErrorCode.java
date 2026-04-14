package com.Connectedm.backend.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // User 관련 에러(400번대)
    ALREADY_REGISTERED_EMAIL(HttpStatus.BAD_REQUEST, "U001", "이미 가입된 이메일입니다!"),
    ALREADY_USED_NICKNAME(HttpStatus.BAD_REQUEST, "U002", "이미 사용 중인 닉네임이에요!"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U003", "해당 사용자를 찾을 수 없습니다!"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "U004", "비밀번호가 일치하지 않습니다!"),
    ALREADY_REGISTERED_PHONE(HttpStatus.BAD_REQUEST, "U005", "이미 등록된 전화번호입니다!"),
    INVALID_PASSWORD_RESET_TOKEN(HttpStatus.BAD_REQUEST, "U006", "유효하지 않은 비밀번호 재설정 토큰입니다."),
    EXPIRED_PASSWORD_RESET_TOKEN(HttpStatus.BAD_REQUEST, "U007", "비밀번호 재설정 토큰이 만료되었습니다."),

    // --- 공통 에러 ---
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C001", "서버에 문제가 생겼어요!");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

}
