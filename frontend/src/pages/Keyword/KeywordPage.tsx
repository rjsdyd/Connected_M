import React, { useState, useEffect } from 'react';
import './KeywordPage.css';

interface MovieData {
  id: number;
  summary: string;
  top_keywords: string;
  poster_path: string;
  title: string;
}

const KeywordPage: React.FC = () => {
  // 실제 DB 데이터를 저장할 상태
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const itemsPerPage = 2;

  // 컴포넌트가 마운트될 때 DB 데이터를 가져옴
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        // 여기에 실제 백엔드 API 주소를 넣으세요 (예: '/api/movies')
        const response = await fetch(''); 
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = movies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(movies.length / itemsPerPage);

  if (isLoading) return <div className="loading">데이터를 불러오는 중...</div>;

  return (
    <div className="keyword-container">
      <div className="purple-frame">
        {currentItems.length > 0 ? (
          currentItems.map((movie) => (
            <div key={movie.id} className="movie-card">
              <div className="poster-area">
                {/* DB의 poster_path가 실제 URL인지 확인 필요 */}
                {movie.poster_path ? (
                  <img src={movie.poster_path} alt={movie.title} className="poster-image" />
                ) : (
                  <span className="poster-fallback">이미지 없음</span>
                )}
              </div>
              
              <div className="info-area">
                <div className="summary-box">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="summary-text">{movie.summary}</p>
                </div>
                
                <div className="keyword-row">
                  {movie.top_keywords && movie.top_keywords.split(',').map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      # {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>표시할 영화 데이터가 없습니다.</p>
        )}
      </div>

      <div className="pagination-bar">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="page-btn"
        >
          &lt;
        </button>
        <span className="page-info">{currentPage} / {totalPages || 1} page</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="page-btn"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default KeywordPage;