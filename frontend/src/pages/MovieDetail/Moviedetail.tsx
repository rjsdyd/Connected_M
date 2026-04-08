import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MovieDetail.css';

/**
 * 1. 인터페이스 정의 (백엔드 DTO와 1:1 매칭)
 */

// TmdbMovieResponseDto.TmdbCastItem 대응
interface CastMember {
  name: string;
  character: string;
  profile_path: string; // @JsonProperty("profile_path") 매핑 결과
  order: number;
}

// ReviewResponseDto 대응
interface ReviewResponse {
  id: number;
  criticName: string;
  rating: string;
  comment: string;
  sourceName: string;
  movieTitle: string;
}

// ContentDetailResponseDto 대응
interface MovieDetailData {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  ottLogos: string;
  genres: string[];
  castList: CastMember[];
  aiSummary: string;
  positiveRatio: number;
  topKeywords: string[];
  expertReviews: ReviewResponse[];
  userReviews: ReviewResponse[];
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // Vite 개발 서버(5173)에서 스프링부트(8080)로 요청
        const response = await axios.get(`http://localhost:8080/api/contents/${id}`);
        
        // 백엔드 ApiResponse 구조가 { data: { ... } }라고 가정
        if (response.data && response.data.data) {
          setMovie(response.data.data);
        } else {
          setMovie(response.data);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieData();
  }, [id]);

  if (loading) return <div className="loading">데이터를 불러오는 중입니다...</div>;
  if (!movie) return <div className="error">영화를 찾을 수 없습니다.</div>;

  // OTT 로고 문자열을 배열로 변환
  const ottList = movie.ottLogos ? movie.ottLogos.split(',') : [];

  return (
    <div className="detail-container">
      <main className="main-content">
        
        {/* 상단 배너 섹션 (포스터 배경) */}
        <section 
          className="banner-section" 
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, #141414 100%), url(${movie.posterPath})` }}
        >
          <div className="info-overlay">
            {/* OTT 플랫폼 아이콘 리스트 */}
            <div className="platform-row">
              {ottList.map((logoPath, i) => (
                <div key={i} className="platform-link">
                  <img src={`https://image.tmdb.org/t/p/original${logoPath}`} alt="OTT" className="platform-icon" />
                </div>
              ))}
            </div>
            
            <div className="genre-list">
              {movie.genres?.map((genre, i) => (
                <span key={i} className="genre-label">{genre}</span>
              ))}
            </div>
            
            <h1 className="movie-title">{movie.title}</h1>
            
            <div className="action-buttons">
              <button className="btn-trailer">트레일러 재생</button>
              <button className="btn-rating">평점 {movie.positiveRatio}%</button>
            </div>
          </div>
        </section>

        {/* 하단 콘텐츠 그리드 */}
        <div className="content-grid">
          
          {/* 왼쪽 컬럼: 출연진, 줄거리, 전문가 리뷰 */}
          <div className="left-column">
            
            {/* 주요 출연진 섹션 */}
            <section className="detail-section">
              <h2 className="section-title">주요 출연진</h2>
              <div className="cast-grid">
                {movie.castList?.map((actor, i) => (
                  <div key={i} className="cast-card">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                        alt={actor.name} 
                        className="cast-photo" 
                      />
                    ) : (
                      <div className="photo-placeholder" />
                    )}
                    <p className="name">{actor.name}</p>
                    <p className="work">{actor.character}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 줄거리 섹션 */}
            <section className="detail-section">
              <h2 className="section-title">줄거리</h2>
              <p className="synopsis-text">{movie.overview}</p>
            </section>

            {/* 전문가의 평가 섹션 */}
            <section className="detail-section">
              <h2 className="section-title">전문가의 평가</h2>
              <div className="expert-grid">
                {movie.expertReviews?.map((review, i) => (
                  <div key={i} className="review-box expert-box">
                    <div className="user-info">
                      <span>{review.criticName} ({review.sourceName})</span>
                      <span className="rating">⭐ {review.rating}</span>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 오른쪽 컬럼: AI 분석 및 유저 리뷰 */}
          <div className="right-column">
            <section className="detail-section">
              <h2 className="section-title">AI 분석 요약</h2>
              <div className="ai-summary-box">
                <p className="ai-text">{movie.aiSummary}</p>
              </div>
              
              <h3 className="sub-title">핵심 키워드</h3>
              <ul className="ai-pick-list">
                {movie.topKeywords?.map((keyword, i) => (
                  <li key={i}># {keyword}</li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h2 className="section-title">유저 리뷰 목록</h2>
              <div className="user-review-grid">
                {movie.userReviews?.length > 0 ? (
                  movie.userReviews.map((review, i) => (
                    <div key={i} className="review-box user-box">
                      <div className="user-info">
                        <span>{review.criticName}</span>
                        <span className="rating">⭐ {review.rating}</span>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-data">작성된 리뷰가 없습니다.</p>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MovieDetail;