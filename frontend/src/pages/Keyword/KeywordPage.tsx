import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KeywordPage.css';

interface MovieData {
  id: number;
  title: string;
  posterPath: string;
  summary: string;
  keywords: string[];
}

const KeywordPage: React.FC = () => {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const navigate = useNavigate();
  const itemsPerPage = 6; 
  const genres = ['전체', '사극', '애니메이션', '로맨스', '액션', '스릴러', 'SF', '공포', '범죄'];

  useEffect(() => {
    const fetchAndCombineData = async () => {
      try {
        setIsLoading(true);
        const [mainRes, aiRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/contents/all`),
          fetch(`${import.meta.env.VITE_API_URL}/api/ai/keywords`)
        ]);

        const mainJson = await mainRes.json();
        const aiData = await aiRes.json();
        const mainList = mainJson.data;

        const combined = mainList.map((movie: any) => {
          const aiMatch = aiData.find((ai: any) => 
            Number(ai.content_id) === Number(movie.id)
          );
          
          return {
            id: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
            summary: aiMatch ? aiMatch.summary : "줄거리 정보를 불러올 수 없습니다.",
            keywords: aiMatch ? aiMatch.keywords : ["분석중"]
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

  const filteredMovies = movies.filter(movie => 
    activeTab === '전체' || movie.keywords.includes(activeTab)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMovies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  if (isLoading) return <div className="loading">DB 매칭 중...</div>;

  return (
    <div className="keyword-container">
      {}
      <div className="filter-tab-bar">
        {genres.map(genre => (
          <button 
            key={genre} 
            className={`tab-btn ${activeTab === genre ? 'active' : ''}`}
            onClick={() => { setActiveTab(genre); setCurrentPage(1); }}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="purple-frame">
        {currentItems.length > 0 ? (
          currentItems.map((movie) => {
            const displayKeywords = activeTab !== '전체'
              ? [activeTab, ...movie.keywords.filter(k => k !== activeTab)].slice(0, 5)
              : movie.keywords.slice(0, 5);

            return (
              <div 
                key={movie.id} 
                className="movie-card"
                onClick={() => navigate(`/movie/${movie.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="poster-area_keyword">
                  {movie.posterPath ? (
                    <img src={movie.posterPath} alt={movie.title} className="poster-image" />
                  ) : (
                    <div className="poster-fallback">이미지 없음</div>
                  )}
                </div>
                
                <div className="info-area">
                  <div className="summary-box">
                    <h3 className="movie-title_keyword">{movie.title}</h3>
                    {}
                    <p className="summary-text">{movie.summary}</p>
                  </div>
                  
                  <div className="keyword-row">
                    {}
                    {displayKeywords.map((tag: string, index: number) => (
                      <span key={index} className="keyword-tag"># {tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-result">해당 장르의 분석 데이터가 아직 없습니다!</div>
        )}
      </div>

      <div className="pagination-bar">
        <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>&lt;</button>
        <span className="page-info">{currentPage} / {totalPages || 1} page</span>
        <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
      </div>
    </div>
  );
};

export default KeywordPage;