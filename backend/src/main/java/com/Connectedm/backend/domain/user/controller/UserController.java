package com.Connectedm.backend.domain.user.controller;

import com.Connectedm.backend.domain.user.dto.MyPageResponseDto;
import com.Connectedm.backend.domain.user.dto.UserResponse;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.domain.user.service.MyPageService;
import com.Connectedm.backend.domain.user.service.UserService;
import com.Connectedm.backend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user") // 👈 주소를 "/api/user"로 바꿔서 충돌을 피합니다!
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final MyPageService myPageService;
    private final BCryptPasswordEncoder passwordEncoder;

    // 마이페이지 정보 조회
    @GetMapping("/{userId}")
    public ApiResponse<MyPageResponseDto> getMyPage(@PathVariable("userId") Long userId) {
        MyPageResponseDto response = myPageService.getMyPageInfo(userId);
        return ApiResponse.success(response);
    }

    // 추가 정보 업데이트
    @PutMapping("/update-extra-info")
    public ApiResponse<String> updateExtraInfo(@RequestBody Map<String, Object> request) {
        try {
            if (request.get("id") == null) return ApiResponse.error("ID가 누락되었습니다.");

            Long id = Long.valueOf(request.get("id").toString());
            String email = (String) request.get("email");
            String phoneNumber = (String) request.get("phoneNumber");
            String password = (String) request.get("password");

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));

            // 전화번호 중복 체크
            if (phoneNumber != null && !phoneNumber.isEmpty() && userRepository.existsByPhoneNumber(phoneNumber) && !phoneNumber.equals(user.getPhoneNumber())) {
                return ApiResponse.error("이미 등록된 전화번호입니다.");
            }

            user.setEmail(email);
            user.setPhoneNumber(phoneNumber);
            if (password != null && !password.isEmpty()) {
                user.setPassword(passwordEncoder.encode(password));
            }

            userRepository.save(user);
            return ApiResponse.success("정보 업데이트 성공!");
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("서버 내부 에러: " + e.getMessage());
        }
    }

    // 닉네임 중복 확인 API
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNickname(@RequestParam String nickname) {
        boolean exists = userRepository.existsByNickname(nickname);
        return ApiResponse.success(exists);
    }
}