package com.Connectedm.backend.domain.user.controller;

import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.service.ContentService;
import com.Connectedm.backend.domain.user.dto.RecentViewResponseDto;
import com.Connectedm.backend.domain.user.entity.User;
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
    private final ContentService contentService; // 영화 존재 여부 확인

    /**
     *  [GET} 최근 열람 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<RecentViewResponseDto>> getRecentViews(
            @AuthenticationPrincipal User user) {

        List<RecentViewResponseDto> response = recentViewService.getRecentViews(user)
                .stream()
                .map(RecentViewResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     *  [POST] 최근 열람 기록 추가/갱신
     */
    @PostMapping("/{contentId}")
    public ResponseEntity<Void> saveOrUpdateRecentView(
            @AuthenticationPrincipal User user,
            @PathVariable Long contentId) {

        // 1. 해당 영화가 있는지 확인
        Content content = contentService.findById(contentId);

        // 2. 서비스 가동(UPSERT)
        recentViewService.saveOrUpdateRecentView(user, content);

        return ResponseEntity.ok().build();
    }
}
