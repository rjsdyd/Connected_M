package com.Connectedm.backend.domain.content.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@Table(name = "ExpertReview")
@Table(name = "expert_review")
public class ExpertReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id")
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id")
    private AnalysisCache analysisCache;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private Cine21Source cine21Source;

    @Column(name = "critic_name", nullable = false, length = 50)
    private String criticName;

    @Column(nullable = true, length = 10)
    private String rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Builder.Default
    @Column(length = 50)
    private String source = "cine21"; // 출처 기본값
}
