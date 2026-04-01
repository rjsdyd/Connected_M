package com.Connectedm.backend.domain.content.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "AnalysisCache")
public class AnalysisCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "positive_ratio", nullable = false, precision = 3, scale = 1)
    private double positiveRatio;

    @Column(name = "top_keywords")
    private String topKeywords;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private Content content;

    // 분석의 근거가 된 수집된(전문가) 리뷰들 (1:N)
    @Builder.Default
    @OneToMany(mappedBy = "analysisCache", cascade = CascadeType.ALL)
    private List<ExpertReview> expertReviews = new ArrayList<>();
}
