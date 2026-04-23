import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaBookmark, FaRegBookmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MovieDetail.css';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface ExpertReviewData {
  id: number;
  criticName: string;
  rating: string;
  comment: string;
  source: string;
}

interface UserReviewData {
  id: number;
  nickname: string;
  rating: string;
  comment: string;
}

interface CastMember {
  name: string;
  character: string;
  profile_path: string;
}

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface MovieDetailData {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  castList: CastMember[];
  runtime: number;
  ageRating: string;
  topKeywords: string[];
  expertReviews: ExpertReviewData[];
  userReviews: UserReviewData[];
  providers: WatchProvider[]; 
  ottLogos?: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { isLoggedIn, userNickname } = useAuth();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false); 

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [expertPage, setExpertPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 3;

  const getProviderUrl = (title: string, providerId?: number, logoPath?: string) => {
    const encodedTitle = encodeURIComponent(title);
    const platformLinks: { [key: string]: string } = {
      netflix: `https://www.netflix.com/search?q=${encodedTitle}`,
      disney: `https://www.disneyplus.com/search?q=${encodedTitle}`,
      tving: `https://www.tving.com/search/all?keyword=${encodedTitle}`,
      wavve: `https://www.wavve.com/search/search?searchKeyword=${encodedTitle}`,
      watcha: `https://watcha.com/search?query=${encodedTitle}`,
      coupang: `https://www.coupangplay.com/search?q=${encodedTitle}`,
      amazon: `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
      apple: `https://tv.apple.com/kr/search?term=${encodedTitle}`,
    };

    if (providerId) {
      const idMap: { [key: number]: string } = {
        8: platformLinks.netflix, 337: platformLinks.disney, 370: platformLinks.tving,
        356: platformLinks.wavve, 97: platformLinks.watcha, 350: platformLinks.coupang,
        119: platformLinks.amazon, 2: platformLinks.apple,
      };
      if (idMap[providerId]) return idMap[providerId];
    }

    if (logoPath) {
      const path = logoPath.toLowerCase();
      if (path.includes('netflix')) return platformLinks.netflix;
      if (path.includes('disney')) return platformLinks.disney;
      if (path.includes('tving')) return platformLinks.tving;
      if (path.includes('wavve')) return platformLinks.wavve;
      if (path.includes('watcha')) return platformLinks.watcha;
      if (path.includes('coupang')) return platformLinks.coupang;
      if (path.includes('amazon')) return platformLinks.amazon;
      if (path.includes('apple')) return platformLinks.apple;
    }

    return `https://www.google.com/search?q=${encodedTitle}+보러가기`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/contents/${id}`);
        const result = await response.json();

        if (result && result.data) {
          const data = result.data;
          setMovie({
            ...data,
            posterPath: data.posterPath ? data.posterPath.replace('https://image.tmdb.org/t/p/w500', '') : "",
            backdropPath: data.backdropPath ? data.backdropPath.replace('https://image.tmdb.org/t/p/original', '') : "",
          });

          if (isLoggedIn && userNickname) {
            setHasReviewed(data.userReviews.some((r: any) => r.nickname === userNickname));

            // ✨ [찜하기 DB 동기화] 백엔드에서 찜 목록을 가져와 현재 영화가 있는지 확인 ㅋ
            const wishRes = await axios.get('http://localhost:8080/api/members/wishlist', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const isWished = wishRes.data.some((w: any) => w.contentId === Number(id));
            setIsWishlisted(isWished);
          }
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id, isLoggedIn, userNickname]);

  // ✨ [찜하기 토글 DB 동기화] API 호출 추가 ㅋ
  const handleWishlistToggle = async () => { 
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    try {
      const token = localStorage.getItem('token');
      // 백엔드 toggleWishlist API 호출 (명준님이 만든 POST /api/members/wishlist/{contentId})
      await axios.post(`http://localhost:8080/api/members/wishlist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsWishlisted(!isWishlisted);

      // 로컬 스토리지도 보조로 업데이트 (원본 로직 유지 ㅋ)
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isAlreadyWished = savedWishlist.some((item: any) => item.contentId === Number(id));
      let newWishlist = isAlreadyWished 
        ? savedWishlist.filter((item: any) => item.contentId !== Number(id))
        : [...savedWishlist, { contentId: Number(id) }];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      
    } catch (error) {
      alert("찜하기 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    if (hasReviewed) { alert("이미 리뷰를 작성하셨습니다."); return; }
    if (!newComment.trim() || newRating === 0) { alert("내용과 별점을 입력해주세요."); return; }

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.post(`http://localhost:8080/api/contents/user-reviews?contentId=${id}`, 
        { rating: newRating.toString(), comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        alert("리뷰가 등록되었습니다!");
        setHasReviewed(true);
        window.location.reload();
      }
    } catch (error) { alert("리뷰 등록 실패!"); }
  };

  const renderStars = (rating: string | number) => {
    const num = Number(rating) / 2;
    return (
      <div className="star-wrapper compact">
        {[...Array(5)].map((_, i) => {
          const isFull = num >= i + 1;
          const isHalf = num >= i + 0.5 && num < i + 1;
          const starClass = (isFull || isHalf) ? "star-icon filled" : "star-icon";
          return isFull ? <FaStar key={i} className={starClass} /> : isHalf ? <FaStarHalfAlt key={i} className={starClass} /> : <FaRegStar key={i} className={starClass} />;
        })}
        <span className="rating-num">{rating}점</span>
      </div>
    );
  };

  if (loading || !movie) return <div className="loading-container">로딩 중...</div>;

  const expertReviewsSlice = movie.expertReviews.slice((expertPage - 1) * itemsPerPage, expertPage * itemsPerPage);
  const userReviewsSlice = movie.userReviews.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalExpertPages = Math.ceil(movie.expertReviews.length / itemsPerPage);
  const totalUserPages = Math.ceil(movie.userReviews.length / itemsPerPage);

  return (
    <div className="detail-container">
      <main className="main-content">
        <section className="banner-section">
          <div className="banner-background-wrapper">
            <div className="banner-bg-image" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdropPath})` }}></div>
            <div className="banner-overlay"></div>
          </div>
          <div className="banner-content">
            <div className="poster-area">
              <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} className="main-poster" />
            </div>
            <div className="info-area">
              <div className="meta-info-row">
                <span className={`age-badge ${movie.ageRating === '19+' ? 'age-19' : 'age-all'}`}>{movie.ageRating}</span>
                <span className="runtime-label">{movie.runtime}분</span>
              </div>
              <h1 className="movie-title">{movie.title}</h1>
              
              <div className="platform-buttons-container">
                <span className="platform-label">시청 가능한 플랫폼</span>
                <div className="platform-logos-row">
                  {movie.providers && movie.providers.length > 0 ? (
                    movie.providers.map((p) => (
                      <a key={p.provider_id} href={getProviderUrl(movie.title, p.provider_id)} target="_blank" rel="noopener noreferrer">
                        <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="ott-logo-simple" title={p.provider_name} />
                      </a>
                    ))
                  ) : movie.ottLogos ? (
                    movie.ottLogos.split(',').map((logo, idx) => {
                      const cleanLogo = logo.trim();
                      const fullUrl = cleanLogo.startsWith('http') ? cleanLogo : `https://image.tmdb.org/t/p/original${cleanLogo}`;
                      return (
                        <a key={idx} href={getProviderUrl(movie.title, undefined, cleanLogo)} target="_blank" rel="noopener noreferrer">
                           <img src={fullUrl} alt="OTT" className="ott-logo-simple" />
                        </a>
                      );
                    })
                  ) : <span className="no-provider">현재 제공 중인 OTT가 없습니다.</span>}
                </div>
                
                <button className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlistToggle}>
                  {isWishlisted ? <FaBookmark /> : <FaRegBookmark />}
                  <span>{isWishlisted ? '찜한 영화' : '찜하기'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div className="left-column">
            <section className="detail-section">
              <h2 className="section-title">주요 출연진</h2>
              <div className="cast-grid">
                {movie.castList.map((p, i) => (
                  <div key={i} className="cast-card">
                    <img src={p.profile_path ? `https://image.tmdb.org/t/p/w200${p.profile_path}` : ''} alt="" className="cast-photo" />
                    <p className="name">{p.name}</p>
                    <p className="character">{p.character}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="detail-section">
              <h2 className="section-title">줄거리</h2>
              <p className="synopsis-text">{movie.overview}</p>
            </section>
          </div>

          <div className="right-column">
            <section className="detail-section">
              <h2 className="section-title">전문가 평점 ({movie.expertReviews.length})</h2>
              <div className="compact-card-container">
                {expertReviewsSlice.length > 0 ? expertReviewsSlice.map((r) => (
                  <div key={r.id} className="compact-review-row">
                    <div className="compact-reviewer-meta">
                      <span className="compact-reviewer-name">{r.criticName} <small>| {r.source}</small></span>
                      {renderStars(r.rating)}
                    </div>
                    <p className="compact-comment-text">"{r.comment}"</p>
                  </div>
                )) : <p className="placeholder-text">전문가 리뷰가 없습니다.</p>}
                
                {totalExpertPages > 1 && (
                  <div className="pagination-controls">
                    <button disabled={expertPage === 1} onClick={() => setExpertPage(p => p - 1)}><FaChevronLeft /></button>
                    <span>{expertPage} / {totalExpertPages}</span>
                    <button disabled={expertPage === totalExpertPages} onClick={() => setExpertPage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                )}
              </div>
            </section>

            <section className="detail-section">
              <h2 className="section-title">관람평 ({movie.userReviews.length})</h2>
              <div className="compact-card-container">
                {userReviewsSlice.length > 0 ? userReviewsSlice.map((r) => (
                  <div key={r.id} className="compact-review-row">
                    <div className="compact-reviewer-meta">
                      <span className="compact-reviewer-name">{r.nickname}</span>
                      {renderStars(r.rating)}
                    </div>
                    <p className="compact-comment-text">{r.comment}</p>
                  </div>
                )) : <p className="placeholder-text">첫 번째 리뷰를 남겨보세요!</p>}

                {totalUserPages > 1 && (
                  <div className="pagination-controls">
                    <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}><FaChevronLeft /></button>
                    <span>{userPage} / {totalUserPages}</span>
                    <button disabled={userPage === totalUserPages} onClick={() => setUserPage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                )}
              </div>
            </section>

            <section className="review-write-section">
              <h2 className="section-title">리뷰 작성</h2>
              {!isLoggedIn ? <div className="already-reviewed-msg">로그인이 필요합니다.</div> : hasReviewed ? (
                <div className="already-reviewed-msg" style={{color: '#4b0082', fontWeight: 'bold'}}>이미 소중한 리뷰를 작성하셨습니다. ✨</div>
              ) : (
                <div className="write-form-container">
                  {/* ✨ [명준님의 정교한 별점 로직] ㅋ */}
                  <div className="interactive-rating-stars-wrapper" onMouseLeave={() => setHoverRating(null)}>
                    {[...Array(5)].map((_, i) => {
                      const displayRating = hoverRating !== null ? hoverRating : newRating;
                      const isFull = displayRating >= (i + 1) * 2;
                      const isHalf = displayRating === (i * 2) + 1;
                      const starClass = (isFull || isHalf) ? "visible-star filled" : "visible-star";
                      return (
                        <div key={i} className="interactive-star-area">
                          {isFull ? <FaStar className={starClass} /> : isHalf ? <FaStarHalfAlt className={starClass} /> : <FaRegStar className={starClass} />}
                          <div className="click-zones-wrapper">
                            <div className="click-zone left-half" onMouseEnter={() => setHoverRating(i * 2 + 1)} onClick={() => setNewRating(i * 2 + 1)} />
                            <div className="click-zone right-half" onMouseEnter={() => setHoverRating(i * 2 + 2)} onClick={() => setNewRating(i * 2 + 2)} />
                          </div>
                        </div>
                      );
                    })}
                    <span className="rating-num-display">{hoverRating !== null ? hoverRating : newRating}점</span>
                  </div>
                  <textarea className="write-textarea" placeholder="감상을 남겨주세요." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
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