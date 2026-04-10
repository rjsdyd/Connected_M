import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ID를 가져오기 위해 추가
import axios from 'axios';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import './MovieDetail.css';
import { useAuth } from '../../hooks/useAuth'; 

// 1. 백엔드 DTO와 1:1 대응하도록 인터페이스 수정
interface CastMember {
  name: string;
  character: string;
  profile_path: string; // Snake case 주의
}

interface ReviewData {
  id: number;
  criticName: string;
  rating: string; // 백엔드 String 합의 반영
  comment: string;
  sourceName: string;
}

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
  expertReviews: ReviewData[];
  userReviews: ReviewData[];
  backdropPath: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URL에서 영화 ID 추출
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { isLoggedIn, userNickname } = useAuth();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [expertPage, setExpertPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const itemsPerPage = 3;

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // 2. 실시간 API 호출 로직
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // 백엔드 API 주소 (환경에 맞춰 수정)
        const response = await axios.get(`http://localhost:8080/api/contents/${id}`);
        const data: MovieDetailData = response.data.data || response.data;

        // 내가 쓴 리뷰가 있는지 체크
        if (isLoggedIn && userNickname) {
          const alreadyHasReview = data.userReviews.some(review => review.criticName === userNickname);
          setHasReviewed(alreadyHasReview);
        }
        
        setMovie(data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMovieData();
  }, [id, isLoggedIn, userNickname]);

  // 별점 렌더링 (String rating을 Number로 변환하여 처리)
  const renderYellowStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const stars = [];
    const ratingOutOfFive = numRating / 2;
    const fullStars = Math.floor(ratingOutOfFive);
    const hasHalfStar = ratingOutOfFive % 1 >= 0.5;

    return (
      <div className="star-wrapper compact icon-based">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) return <FaStar key={i} className="star-icon compact filled" />;
          if (i === fullStars && hasHalfStar) return <FaStarHalfAlt key={i} className="star-icon compact half" />;
          return <FaRegStar key={i} className="star-icon compact empty" />;
        })}
        <span className="rating-num compact">{numRating}점</span>
      </div>
    );
  };

  // 3. 리뷰 등록 API 연동
  const handleReviewSubmit = async () => {
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    if (hasReviewed) { alert("리뷰는 한 번만 작성 가능합니다."); return; }
    if (!newComment.trim()) { alert("내용을 입력해주세요."); return; }
    if (newRating === 0) { alert("별점을 선택해주세요."); return; }

    try {
      const reviewRequest = {
        contentId: movie?.id,
        criticName: userNickname,
        rating: newRating.toString(),
        comment: newComment
      };

      // 실제 백엔드 POST 요청
      await axios.post(`http://localhost:8080/api/reviews`, reviewRequest);
      
      alert("리뷰가 성공적으로 등록되었습니다!");
      window.location.reload(); // 데이터 갱신을 위해 새로고침 혹은 상태 업데이트
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  const getPagedData = (data: any[], page: number) => data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPagesCount = (len: number) => Math.ceil(len / itemsPerPage);

  const renderNav = (cur: number, total: number, set: any) => (
    <div className="compact-controller">
      <button className="nav-btn" onClick={() => set(prev => Math.max(0, prev - 1))} disabled={cur === 0}>‹</button>
      <span className="page-indicator">{cur + 1}/{total}</span>
      <button className="nav-btn" onClick={() => set(prev => Math.min(total - 1, prev + 1))} disabled={cur === total - 1}>›</button>
    </div>
  );

  const handleInteractiveStarClick = (starIndex: number, isHalf: boolean) => {
    if (hasReviewed || !isLoggedIn) return; 
    setNewRating((starIndex * 2) + (isHalf ? 1 : 2));
  };

  if (loading || !movie) return <div className="loading-container">데이터를 불러오는 중...</div>;

  // OTT 로고 처리 (쉼표 구분)
  const ottLogos = movie.ottLogos ? movie.ottLogos.split(',') : [];

  return (
    <div className="detail-container">
      <main className="main-content">
        <section 
                  className="banner-section" 
                  style={{ 
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(https://image.tmdb.org/t/p/original${movie.backdropPath})` 
                  }}
                >
          <div className="info-overlay">
            <div className="platform-row">
              {ottLogos.map((logo, i) => (
                <div key={i} className="platform-link">
                  <img src={`https://image.tmdb.org/t/p/original${logo}`} alt="OTT" className="platform-icon" />
                </div>
              ))}
            </div>  
            <div className="genre-list">
               {movie.genres.map((g, i) => <span key={i} className="genre-label">{g}</span>)}
            </div>
            <h1 className="movie-title">{movie.title}</h1>
          </div>
        </section>

        <div className="content-grid">
          <div className="left-column">
            <section className="detail-section">
              <h2 className="section-title">주요 출연진</h2>
              <div className="cast-grid">
                {movie.castList.map((p, i) => (
                  <div key={i} className="cast-card">
                    {p.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${p.profile_path}`} alt={p.name} className="cast-photo" />
                    ) : (
                      <div className="photo-placeholder" />
                    )}
                    <p className="name">{p.name}</p>
                    <p className="work">{p.character}</p>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="detail-section">
              <h2 className="section-title">줄거리</h2>
              <p className="synopsis-text">{movie.overview}</p>
            </section>

            <section className="detail-section">
              <h2 className="section-title">AI 분석 요약</h2>
              <div className="ai-summary-box">
                <p>{movie.aiSummary}</p>
              </div>
              <h3 className="sub-title">핵심 키워드</h3>
              <ul className="ai-pick-list">
                {movie.topKeywords.map((k, i) => <li key={i}># {k}</li>)}
              </ul>
            </section>
          </div>

          <div className="right-column">
            <section className="detail-section compact-reviews-section">
              <h2 className="section-title">전문가 평점</h2>
              <div className="compact-card-container">
                <div className="compact-card-content">
                  {getPagedData(movie.expertReviews, expertPage).map((r, i) => (
                    <div key={i} className="compact-review-row">
                      <div className="compact-reviewer-meta">
                        <span className="compact-reviewer-name">{r.criticName} ({r.sourceName})</span>
                        {renderYellowStars(r.rating)}
                      </div>
                      <p className="compact-comment-text">{r.comment}</p>
                    </div>
                  ))}
                </div>
                {renderNav(expertPage, totalPagesCount(movie.expertReviews.length), setExpertPage)}
              </div>
            </section>

            <section className="detail-section compact-reviews-section">
              <h2 className="section-title">관람평 리뷰 ({movie.userReviews.length}건)</h2>
              <div className="compact-card-container">
                <div className="compact-card-content">
                  {getPagedData(movie.userReviews, userPage).map((r, i) => (
                    <div key={i} className="compact-review-row">
                      <div className="compact-reviewer-meta">
                        <span className="compact-reviewer-name">{r.criticName}</span>
                        {renderYellowStars(r.rating)}
                      </div>
                      <p className="compact-comment-text">{r.comment}</p>
                    </div>
                  ))}
                </div>
                {renderNav(userPage, totalPagesCount(movie.userReviews.length), setUserPage)}
              </div>
            </section>

            {/* 리뷰 작성 섹션 */}
            <section className="review-write-section">
               <h2 className="write-title">리뷰 작성</h2>
              {!isLoggedIn ? (
                <div className="already-reviewed-msg">로그인이 필요한 서비스입니다.</div>
              ) : hasReviewed ? (
                <div className="already-reviewed-msg">이미 리뷰를 작성하셨습니다.</div>
              ) : (
                <div className="write-form-container">
                  <div className="interactive-rating-stars-wrapper half-star-support" onMouseLeave={() => setHoverRating(null)}>
                    {[...Array(5)].map((_, i) => {
                      const displayRating = hoverRating !== null ? hoverRating : newRating;
                      let StarIcon = FaRegStar;
                      if (displayRating >= i * 2 + 2) StarIcon = FaStar;
                      else if (displayRating >= i * 2 + 1) StarIcon = FaStarHalfAlt;

                      return (
                        <div key={i} className="interactive-star-area">
                          <StarIcon className="interactive-star-icon visible-star" />
                          <div className="click-zones-wrapper">
                            <div className="click-zone left-half" onMouseEnter={() => setHoverRating(i * 2 + 1)} onClick={() => handleInteractiveStarClick(i, true)} />
                            <div className="click-zone right-half" onMouseEnter={() => setHoverRating(i * 2 + 2)} onClick={() => handleInteractiveStarClick(i, false)} />
                          </div>
                        </div>
                      );
                    })}
                    <span className="rating-num compact">{hoverRating !== null ? hoverRating : newRating}점</span>
                  </div>
                  <textarea 
                    className="write-textarea" 
                    placeholder={`${userNickname}님, 솔직한 감상을 남겨주세요.`}
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                  />
                  <button className="btn-submit-review" onClick={handleReviewSubmit}>리뷰 등록</button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetail;