import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaTrashAlt, FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // 🚀 FaEdit 추가
import './MyReviewsPage.css';
import axios from 'axios';

// ... (interface 및 formatDate 동일하게 유지)
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
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
};

const MyReviewsPage: React.FC = () => {
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const navigate = useNavigate();

  // [기존 페치 로직 유지]
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
          const sortedData = [...response.data.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReviews(sortedData);
        }
      } catch (error) { console.error("로딩 실패:", error); } 
      finally { setLoading(false); }
    };
    fetchMyReviews();
  }, [navigate]);

  // [기존 페이지네이션 로직 유지]
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // [기존 단일 삭제 로직 유지]
  const handleDelete = async (e: React.MouseEvent, reviewId: number) => {
    e.stopPropagation();
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8080/api/contents/user-reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setReviews(reviews.filter(r => r.reviewId !== reviewId));
        if (currentReviews.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      }
    } catch (error) { alert("삭제 실패!"); }
  };

  // 🚀 [신규] 리뷰 수정 로직 추가
  const handleEdit = async (e: React.MouseEvent, review: MyReviewItem) => {
    e.stopPropagation();
    const newComment = prompt("수정할 내용을 입력하세요:", review.comment);
    if (!newComment || newComment === review.comment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/contents/user-reviews/${review.reviewId}`, 
        { comment: newComment, rating: review.rating }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setReviews(prev => prev.map(r => r.reviewId === review.reviewId ? { ...r, comment: newComment } : r));
        alert("수정되었습니다!");
      }
    } catch (error) { alert("수정 권한이 없거나 실패했습니다."); }
  };

  // 🚀 [최적화] 전체 삭제 로직을 백엔드 전용 API로 변경
  const handleDeleteAll = async () => {
    if (!window.confirm('정말로 모든 리뷰를 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('token');
    try {
      // Promise.all 대신 백엔드에서 만든 "전체 삭제 딸깍" API 호출
      const response = await axios.delete(`http://localhost:8080/api/user-reviews/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setReviews([]);
        alert('모든 리뷰가 삭제되었습니다.');
      }
    } catch (error) { alert('전체 삭제에 실패했습니다.'); }
  };

  // [기존 스타 렌더링/토글 로직 유지]
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

  const toggleReview = (e: React.MouseEvent, reviewId: number) => {
    e.stopPropagation();
    setExpandedReviews(prev => prev.includes(reviewId) ? prev.filter(id => id !== reviewId) : [...prev, reviewId]);
  };

  if (loading) return <div className="loading-msg">리뷰 불러오는 중...</div>;

  return (
    <div className="my-reviews-container">
      <div className="reviews-card-box">
        <header className="reviews-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FaChevronLeft /></button>
          <h2 className="title-text">내가 작성한 리뷰 <span className="count-num">{reviews.length}</span></h2>
          {reviews.length > 0 && <button className="delete-all-btn" onClick={handleDeleteAll}>전체 삭제</button>}
        </header>

        {reviews.length > 0 ? (
          <>
            <div className="reviews-list-wrapper">
              {currentReviews.map((review) => {
                const isExpanded = expandedReviews.includes(review.reviewId);
                const isLongText = review.comment.length > 50;

                return (
                  <div key={review.reviewId} className="review-item-card" onClick={() => navigate(`/movie/${review.contentId}`)}>
                    <div className="poster-wrapper">
                      <img 
                        src={review.posterPath && review.posterPath.startsWith('http') ? review.posterPath : `https://image.tmdb.org/t/p/w200${review.posterPath}`} 
                        alt={review.movieTitle} className="small-poster"
                      />
                    </div>
                    
                    <div className="review-main-info">
                      <div className="info-top-row">
                        <div className="name-and-user">
                          <h3 className="movie-name">{review.movieTitle}</h3>
                        </div>
                        <div className="action-btns">
                          {/* 🚀 수정 버튼 추가 */}
                          <button className="edit-icon-btn" onClick={(e) => handleEdit(e, review)}><FaEdit /></button>
                          <button className="delete-icon-btn" onClick={(e) => handleDelete(e, review.reviewId)}><FaTrashAlt /></button>
                        </div>
                      </div>
                      
                      {renderStars(review.rating)}
                      <p className={`user-comment-text ${isExpanded ? 'expanded' : 'clamped'}`}>{review.comment}</p>

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
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><FaChevronLeft /></button>
                <span className="page-info">{currentPage} / {totalPages}</span>
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><FaChevronRight /></button>
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