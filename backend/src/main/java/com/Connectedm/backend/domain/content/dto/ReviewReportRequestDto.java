package com.Connectedm.backend.domain.content.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReportRequestDto {
    private String reason; // 신고 사유
}
