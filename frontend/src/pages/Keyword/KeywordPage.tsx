import React, { useState, useEffect } from 'react';
import './KeywordPage.css';

interface MovieData {
  id: number;
  title: string;
  posterPath: string;
  summary: string;
  top_keywords: string;
}

const KeywordPage: React.FC = () => {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchAndCombineData = async () => {
      try {
        setIsLoading(true);

        const [mainRes, aiRes] = await Promise.all([
          fetch('http://localhost:8080/api/contents/main'),
          fetch('http://localhost:8080/api/ai/keywords')  // 이부분 수정 필요
        ]);

        const mainJson = await mainRes.json();
        const aiData = await aiRes.json();

        // 이미지의 todayRecommendations 경로에 접근
        const mainList = mainJson.data.todayRecommendations;

        const combined = mainList.map((movie: any) => {
          /**
           * 핵심: content_id 매칭
           * aiData의 content_id와 movie.id의 타입을 맞추기 위해 Number() 처리
           */
          const aiMatch = aiData.find((ai: any) => 
            Number(ai.content_id) === Number(movie.id)
          );
          
          return {
            id: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
            // 이미지의 summary와 top_keywords 필드 매칭
            summary: aiMatch ? aiMatch.summary : "줄거리 정보를 불러올 수 없습니다.",
            top_keywords: aiMatch ? aiMatch.top_keywords : "분석중"
          };
        });

        setMovies(combined);
      } catch (error) {
        console.error("데이터 매칭 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCombineData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = movies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(movies.length / itemsPerPage);

  if (isLoading) return <div className="loading">DB 매칭 중...</div>;

  return (
    <div className="keyword-container">
      <div className="purple-frame">
        {currentItems.map((movie) => (
          <div key={movie.id} className="movie-card">
            <div className="poster-area">
              {movie.posterPath ? (
                <img src={movie.posterPath} alt={movie.title} className="poster-image" />
              ) : (
                <div className="poster-fallback">이미지 없음</div>
              )}
            </div>
            
            <div className="info-area">
              <div className="summary-box">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="summary-text">{movie.summary}</p>
              </div>
              
              <div className="keyword-row">
                {/* ,로 구분된 키워드를 배열로 변환 */}
                {movie.top_keywords.split(',').map((tag: string, index: number) => (
                  <span key={index} className="keyword-tag">
                    # {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-bar">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>&lt;</button>
        <span className="page-info">{currentPage} / {totalPages || 1} page</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>&gt;</button>
      </div>
    </div>
  );
};

export default KeywordPage;