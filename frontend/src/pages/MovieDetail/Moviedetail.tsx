import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import './MovieDetail.css';
import { useAuth } from '../../hooks/useAuth'; 

interface ExpertReviewData {
  author: string;
  rating: number;
  comment: string;
}

interface UserReviewData {
  author: string;
  rating: number;
  comment: string;
}

interface MovieDetailData {
  title: string;
  genre: string;
  synopsis: string;
  platforms: { name: string; url: string; logo: string }[];
  cast: { name: string; work: string; image: string }[];
  expertReviews: ExpertReviewData[];
  aiRecommendations: string[];
  userReviews: UserReviewData[];
}

const MovieDetail: React.FC = () => {
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // useAuth에서 강화된 로그인 체크 로직을 가져옵니다.
  const { isLoggedIn, userNickname } = useAuth();
  
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [expertPage, setExpertPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const itemsPerPage = 3;

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        
        // Mock 데이터 설정
        const mockData: MovieDetailData = {
          title: "영화제목",
          genre: "장르",
          synopsis: "인간들과의 전쟁으로 첫째 아들을 잃은 후, '제이크'와 '네이티리'는 깊은 슬픔에 빠진다...",
          platforms: [
            { name: "Netflix", url: "https://www.netflix.com/kr/", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
            { name: "Watcha", url: "https://watcha.com/browse/all", logo: "https://watcha.com/favicon.ico" }
          ],
          cast: Array(4).fill({ name: "출연진 이름", work: "출연진 작품의 이름", image: "" }),
          expertReviews: [
            { author: "이자연", rating: 7, comment: "영화는 잊힌 역사를 어떻게 회복시키나, 그에 대해 응답한다" },
            { author: "정재현", rating: 6, comment: "소시민적 욕망과 역사적 비극의 교차점 위에 선 사극" },
            { author: "조현나", rating: 7, comment: "죽음이 두렵지 않은 왕과 통인의 존재감이 묵직하다" },
            { author: "박평식", rating: 6, comment: "두 배우가 앞서거니 뒤서거니" },
            { author: "이용철", rating: 7, comment: "哀史의 淚河 위로 미소 한잎 띄우다" },
            { author: "최선", rating: 7, comment: "장항준 감독의 온도가 끓는점에 도달하다" },
            { author: "김철홍", rating: 6, comment: "왕을 사랑해본 적 있는 사람들의 마음을 두루 살피다" }
          ],
          aiRecommendations: ["AI 가 추천하는 이유 1번", "AI 가 추천하는 이유 2번", "AI 가 추천하는 이유 3번"],
          userReviews: [
            { author: "무비마니아", rating: 10, comment: "인생 영화입니다! 압도적인 영상미와 감동적인 스토리!" },
            { author: "CGV알바생", rating: 8, comment: "전작의 명성을 잇는 훌륭한 속편. 3D로 보는 것을 추천합니다." },
            { author: "팝콘빌런", rating: 9, comment: "가족과 함께 보기 좋은 최고의 오락 영화!" },
            { author: "평론가지망생", rating: 7, comment: "기술력은 정점에 달했으나, 스토리는 전형적이다." },
            { author: "주말의명화", rating: 8, comment: "긴 러닝타임이 지루하지 않을 정도로 몰입감이 뛰어납니다." },
            { author: "시네필", rating: 10, comment: "제임스 카메론은 역시 거장이다. 판도라의 세계에 다시 빠져들었다." },
          ]
        };

        // 로그인이 되어있을 때만 내 닉네임으로 쓴 리뷰가 있는지 체크합니다.
        if (isLoggedIn && userNickname) {
          const alreadyHasReview = mockData.userReviews.some(review => review.author === userNickname);
          setHasReviewed(alreadyHasReview);
        } else {
          setHasReviewed(false);
        }
        
        setMovie(mockData);
      } catch (error) {
        console.error("데이터 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [isLoggedIn, userNickname]); // 로그인 상태나 닉네임이 바뀌면 다시 체크

  const renderYellowStars = (rating: number) => {
    const stars = [];
    const ratingOutOfFive = rating / 2;
    const fullStars = Math.floor(ratingOutOfFive);
    const hasHalfStar = ratingOutOfFive % 1 >= 0.5;

    return (
      <div className="star-wrapper compact icon-based">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="star-icon compact filled" />;
          } else if (i === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={i} className="star-icon compact half" />;
          } else {
            return <FaRegStar key={i} className="star-icon compact empty" />;
          }
        })}
        <span className="rating-num compact">{rating}점</span>
      </div>
    );
  };

  const handleReviewSubmit = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    if (hasReviewed) {
      alert("리뷰는 영화당 한 번만 작성할 수 있습니다.");
      return;
    }

    if (!newComment.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    
    const newEntry: UserReviewData = { 
      author: userNickname || "Unknown", 
      rating: newRating, 
      comment: newComment 
    };

    if (movie) {
      setMovie({
        ...movie,
        userReviews: [newEntry, ...movie.userReviews]
      });
      setHasReviewed(true);
    }

    setNewComment("");
    setNewRating(0); 
    setUserPage(0); 
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
    const newComputedRating = (starIndex * 2) + (isHalf ? 1 : 2);
    setNewRating(newComputedRating);
  };

  const handleStarMouseEnter = (starIndex: number, isHalf: boolean) => {
    if (hasReviewed || !isLoggedIn) return;
    setHoverRating((starIndex * 2) + (isHalf ? 1 : 2));
  };

  if (loading || !movie) return <div className="loading-container">로딩 중...</div>;

  return (
    <div className="detail-container">
      <main className="main-content">
        <section className="banner-section">
          <div className="info-overlay">
            <div className="platform-row">
              {movie.platforms.map((p, i) => (
                <a key={i} href={p.url} className="platform-link" target="_blank" rel="noopener noreferrer">
                  {p.logo ? <img src={p.logo} alt={p.name} className="platform-icon" /> : <span>{p.name}</span>}
                </a>
              ))}
            </div>  
            <span className="genre-label">{movie.genre}</span>
            <h1 className="movie-title">{movie.title}</h1>
            <div className="action-buttons">
              <button className="btn-trailer">트레일러 재생</button>
              <button className="btn-rating">평점</button>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div className="left-column">
            <section className="detail-section">
              <h2 className="section-title">주요 출연진</h2>
              <div className="cast-grid">
                {movie.cast.map((p, i) => (
                  <div key={i} className="cast-card">
                    <div className="photo-placeholder" />
                    <p className="name">{p.name}</p>
                    <p className="work">{p.work}</p>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="detail-section">
              <h2 className="section-title">줄거리</h2>
              <p className="synopsis-text">{movie.synopsis}</p>
            </section>

            <section className="detail-section">
              <h2 className="section-title">AI가 추천하는 PICK MOVIE</h2>
              <ul className="ai-pick-list">
                {movie.aiRecommendations.map((r, i) => <li key={i}>{r}</li>)}
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
                        <span className="compact-reviewer-name">{r.author}</span>
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
              <h2 className="section-title">관람평 리뷰 목록 ({movie.userReviews.length}건)</h2>
              <div className="compact-card-container">
                <div className="compact-card-content">
                  {getPagedData(movie.userReviews, userPage).map((r, i) => (
                    <div key={i} className="compact-review-row">
                      <div className="compact-reviewer-meta">
                        <span className="compact-reviewer-name">{r.author}</span>
                        {renderYellowStars(r.rating)}
                      </div>
                      <p className="compact-comment-text">{r.comment}</p>
                    </div>
                  ))}
                </div>
                {renderNav(userPage, totalPagesCount(movie.userReviews.length), setUserPage)}
              </div>
            </section>

            {/* 리뷰 작성 섹션: 이제 isLoggedIn 값에 따라 정확히 렌더링됩니다. */}
            <section className="review-write-section">
              <div className="write-header">
                <h2 className="write-title">리뷰 작성</h2>
              </div>

              {!isLoggedIn ? (
                <div className="already-reviewed-msg">
                  리뷰를 작성하시려면 로그인이 필요합니다.
                </div>
              ) : hasReviewed ? (
                <div className="already-reviewed-msg">
                  이미 이 영화에 대한 리뷰를 남기셨습니다.
                </div>
              ) : (
                <div className="write-form-container">
                  <div className="interactive-rating-stars-wrapper half-star-support" onMouseLeave={() => setHoverRating(null)}>
                    {[...Array(5)].map((_, i) => {
                      const starValue = i * 2;
                      const displayRating = hoverRating !== null ? hoverRating : newRating;
                      let StarIcon = FaRegStar;
                      let extraClass = "empty";

                      if (displayRating >= starValue + 2) {
                        StarIcon = FaStar;
                        extraClass = "filled";
                      } else if (displayRating >= starValue + 1) {
                        StarIcon = FaStarHalfAlt;
                        extraClass = "half";
                      }

                      return (
                        <div key={i} className="interactive-star-area">
                          <StarIcon className={`interactive-star-icon visible-star ${extraClass}`} />
                          <div className="click-zones-wrapper">
                            <div className="click-zone left-half" onMouseEnter={() => handleStarMouseEnter(i, true)} onClick={() => handleInteractiveStarClick(i, true)} />
                            <div className="click-zone right-half" onMouseEnter={() => handleStarMouseEnter(i, false)} onClick={() => handleInteractiveStarClick(i, false)} />
                          </div>
                        </div>
                      );
                    })}
                    <span className="rating-num compact">{(hoverRating !== null ? hoverRating : newRating)}점</span>
                  </div>
                  
                  <div className="textarea-container">
                    <textarea 
                      className="write-textarea" 
                      placeholder={`${userNickname || '회원'}님, 솔직한 감상을 남겨주세요.`} 
                      value={newComment} 
                      maxLength={200} 
                      onChange={(e) => setNewComment(e.target.value)} 
                    />
                    <span className="char-counter">{newComment.length}/200</span>
                  </div>
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