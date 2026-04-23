package com.Connectedm.backend.domain.user.controller;

import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.service.ContentService;
import com.Connectedm.backend.domain.user.dto.RecentViewResponseDto;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.domain.user.service.RecentViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/recnet")
public class RecentViewController {
    private final RecentViewService recentViewService;
    private final ContentService contentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<RecentViewResponseDto>> getRecentViews(
            @AuthenticationPrincipal User user) {

        // 💡 [수정] 이메일 대신 ID로 찾습니다. 로그에 이미 id로 찾는 쿼리가 성공하는 게 보입니다.
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<RecentViewResponseDto> response = recentViewService.getRecentViews(persistentUser)
                .stream()
                .map(RecentViewResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{contentId}")
    public ResponseEntity<Void> saveOrUpdateRecentView(
            @AuthenticationPrincipal User user,
            @PathVariable Long contentId) {

        // 💡 [수정] 여기서도 ID로 조회하여 '진짜 유저' 객체를 확보합니다.
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Content content = contentService.findById(contentId);

        // 명준님이 짜신 서비스 로직 그대로 실행
        recentViewService.saveOrUpdateRecentView(persistentUser, content);

        return ResponseEntity.ok().build();
    }
}