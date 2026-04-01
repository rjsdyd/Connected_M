package com.Connectedm.backend.domain.content.controller;

import com.Connectedm.backend.domain.content.dto.ContentDetailResponseDto;
import com.Connectedm.backend.domain.content.dto.MainPageResponseDto;
import com.Connectedm.backend.domain.content.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // 메인페이지 데이터 조회
    @GetMapping("/main")
    public ResponseEntity<MainPageResponseDto> getMainPage() {
        return ResponseEntity.ok(contentService.getMainPageData());
    }

    // 상세 페이지 데이터 조회
    @GetMapping("/{id}")
    public ResponseEntity<ContentDetailResponseDto> getContentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getContentDetail(id));
    }
}
