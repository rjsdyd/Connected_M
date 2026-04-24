import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MyReviewsPage.css';
import axios from 'axios';

interface MyReviewItem {
  reviewId: number;
  contentId: number;
  movieTitle: string;
  posterPath: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};


const MyReviewsPage: React.FC = () => {
  
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 ㅋ
  const reviewsPerPage = 3; // 한 페이지에 3개씩 ㅋ
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user-reviews/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
  // 1. 데이터를 복사해서 정렬합니다.
  const sortedData = [...response.data.data].sort((a, b) => 
    // 2. b(뒤의 것)에서 a(앞의 것)를 빼서 최신순(내림차순)으로 만듭니다.
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // 3. 정렬된 데이터를 상태에 저장합니다.
  setReviews(sortedData);
}
      } catch (error) {
        console.error("로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReviews();
  }, [navigate]);

  // 페이지네이션 계산 로직 ㅋ
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handleDelete = async (e: React.MouseEvent, reviewId: number) => {
    e.stopPropagation();
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8080/api/contents/user-reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        const updatedReviews = reviews.filter(r => r.reviewId !== reviewId);
        setReviews(updatedReviews);
        // 삭제 후 현재 페이지에 리뷰가 없으면 이전 페이지로 이동 ㅋ
        if (currentReviews.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) { alert("삭제 실패!"); }
  };

  const renderStars = (rating: number) => {
    const num = rating / 2;
    return (
      <div className="review-stars-row">
        {[...Array(5)].map((_, i) => {
          const isFull = num >= i + 1;
          const isHalf = num >= i + 0.5 && num < i + 1;
          return isFull ? <FaStar key={i} className="star-icon filled" /> : isHalf ? <FaStarHalfAlt key={i} className="star-icon filled" /> : <FaRegStar key={i} className="star-icon" />;
        })}
        <span className="rating-text">{rating}점</span>
      </div>
    );
  };

  if (loading) return <div className="loading-msg">리뷰 불러오는 중...</div>;

  const handleDeleteAll = async () => {
  if (!window.confirm('정말로 모든 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  const token = localStorage.getItem('token');
  try {
    // 모든 리뷰 ID를 반복하거나 서버의 전체 삭제 API를 호출
    await Promise.all(reviews.map(r => 
      axios.delete(`http://localhost:8080/api/user-reviews/${r.reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ));
    setReviews([]); // 상태 비우기
    alert('모든 리뷰가 삭제되었습니다.');
  } catch (error) {
    alert('일부 리뷰 삭제에 실패했습니다.');
  }
};


// 토글 함수 (클릭하면 열고 닫는 스위치)
const toggleReview = (e: React.MouseEvent, reviewId: number) => {
  e.stopPropagation(); // 카드 클릭 시 페이지 이동 방지
  setExpandedReviews(prev => 
    prev.includes(reviewId) 
      ? prev.filter(id => id !== reviewId) 
      : [...prev, reviewId]
  );
};

;


  return (
  <div className="my-reviews-container">
    <div className="reviews-card-box">
      <header className="reviews-header">
        <button className="back-btn" onClick={() => navigate(-1)}><FaChevronLeft /></button>
        <h2 className="title-text">내가 작성한 리뷰 <span className="count-num">{reviews.length}</span></h2>

        {reviews.length > 0 && (
          <button className="delete-all-btn" onClick={handleDeleteAll}>
            전체 삭제
          </button>
        )}
      </header>

      {reviews.length > 0 ? (
        <>
          <div className="reviews-list-wrapper">
            {currentReviews.map((review) => {
              // 1. 필요한 데이터 계산 (펼쳐짐 여부, 80자 초과 여부)
              const isExpanded = expandedReviews.includes(review.reviewId);
              const isLongText = review.comment.length > 50;

              return (
                <div key={review.reviewId} className="review-item-card" onClick={() => navigate(`/movie/${review.contentId}`)}>
                  <div className="poster-wrapper">
                    <img 
                      src={review.posterPath && review.posterPath.startsWith('http') ? review.posterPath : `https://image.tmdb.org/t/p/w200${review.posterPath}`} 
                      alt={review.movieTitle} 
                      className="small-poster"
                    />
                  </div>
                  
                  <div className="review-main-info">
                    <div className="info-top-row">
                      <div className="name-and-user">
                        <h3 className="movie-name">{review.movieTitle}</h3>
                        
                          
                        
                      </div>
                      <button className="delete-icon-btn" onClick={(e) => handleDelete(e, review.reviewId)}><FaTrashAlt /></button>
                    </div>
                    
                    {renderStars(review.rating)}
                    
                    {/* 2. 클래스명만 상태에 따라 변경 (style 제거됨) */}
                    <p className={`user-comment-text ${isExpanded ? 'expanded' : 'clamped'}`}>
                      {review.comment}
                    </p>

                    {/* 3. 80자가 넘을 때만 버튼 표시 */}
                    {isLongText && (
                      <button className="btn-more-detail" onClick={(e) => toggleReview(e, review.reviewId)}>
                        {isExpanded ? '접기' : '자세히 보기'}
                      </button>
                    )}
                    
                    <span className="created-date-label">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button 
                className="page-btn" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FaChevronLeft />
              </button>
              <span className="page-info">{currentPage} / {totalPages}</span>
              <button 
                className="page-btn" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-reviews">
          <p>작성한 리뷰가 없습니다.</p>
          <button className="go-home-btn" onClick={() => navigate('/')}>영화 보러가기</button>
        </div>
      )}
    </div>
  </div>
);
};

export default MyReviewsPage;