import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResult.css';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/contents/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result.data) {
          const mapped = result.data.map((m: any) => ({
            ...m,
            poster_path: m.posterPath,
            id: m.id,
            release_date: m.releaseDate || "개봉일 정보 없음", // 백엔드 필드명 확인 필요
            overview: m.overview || "줄거리 정보가 없습니다." // 백엔드 필드명 확인 필요
          }));
          setResults(mapped);
        }
      } catch (error) {
        console.error("검색 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <main className="search-result-container">
      <div className="search-header-info">
        <h2 className="search-query-title">
          <span>"{query}"</span> 검색 결과 ({results.length}건)
        </h2>
      </div>

      {loading ? (
        <div className="loading-message">영화 정보를 가져오고 있습니다...</div>
      ) : results.length > 0 ? (
        <div className="search-list-wrapper">
          {results.map((movie) => (
            <div 
              key={movie.id} 
              className="search-result-card" 
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              {/* 포스터 영역 (왼쪽) */}
              <div className="search-poster-box">
                <img 
                  src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                />
              </div>

              {/* 텍스트 정보 영역 (오른쪽) */}
              <div className="search-info-box">
                <h3 className="search-movie-title">{movie.title}</h3>
                <p className="search-movie-date">{movie.release_date}</p>
                <p className="search-movie-overview">{movie.overview}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-search-results">
          검색된 결과가 없습니다.
        </div>
      )}
    </main>
  );
};

export default SearchResult;