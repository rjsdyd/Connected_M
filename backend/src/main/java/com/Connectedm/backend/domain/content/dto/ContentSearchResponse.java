package com.Connectedm.backend.domain.content.dto;

import lombok.Builder;
import lombok.Getter;

@Getter@Builder
public class ContentSearchResponse {
    private Long contentId;
    private String title;
    private String posterPath;
    private double similaritySource;
}
