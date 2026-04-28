import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResult.css';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(""); 

  const genres = [
    "액션", "코미디", "범죄", "스릴러", "드라마", "가족", "모험", 
    "판타지", "미스터리", "공포", "SF", "애니메이션", "로맨스", 
    "역사", "전쟁", "음악", "서부"
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/contents/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        console.log("받아온 데이터 확인:", result.data); // 데이터 구조 확인용

        if (result.data) {
          const mapped = result.data.map((m: any) => {
            const genreArray = Array.isArray(m.genres) ? m.genres : [];

            return {
              ...m,
              poster_path: m.poster_path || m.posterpath || m.posterPath || "",
              id: m.id,
              overview: m.overview || m.contents_overview || "줄거리 정보가 없습니다.",
              genreList: genreArray 
            };
          });
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

  const filteredResults = results.filter(movie => {
    if (!selectedGenre) return true; 
    return movie.genreList && movie.genreList.includes(selectedGenre);
  });

  return (
    <main className="search-result-container">
      <aside className="search-sidebar">
        <div className="sidebar-card">
          <h3 className="sidebar-title">검색 결과</h3>
          <ul className="category-list genre-list">
            {genres.map((genre) => {
              // 각 영화의 genreList를 뒤져서 해당 장르가 포함된 개수를 계산합니다.
              const count = results.filter(movie => 
                movie.genreList && movie.genreList.includes(genre)
              ).length;

              return (
                <li 
                  key={genre}
                  className={selectedGenre === genre ? "active" : ""}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {/* [요청] 괄호를 제거하고 숫자만 표시 */}
                  {genre} <span className="genre-count">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <section className="search-content-area">
        <div className="search-header-info">
          <h2 className="search-query-title">
            <span>"{query}"</span> 검색 결과 ({results.length}건)
          </h2>
        </div>

        {loading ? (
          <div className="loading-message">정보를 가져오는 중...</div>
        ) : filteredResults.length > 0 ? (
          <div className="search-list-wrapper">
            {filteredResults.map((movie) => (
              <div key={movie.id} className="search-result-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="search-poster-box">
                  <img 
                    src={movie.poster_path?.startsWith('http') 
                      ? movie.poster_path 
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title} 
                  />
                </div>
                <div className="search-info-box">
                  <h3 className="search-movie-title">{movie.title}</h3>
                  <p className="search-movie-overview">{movie.overview}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-result-message">
             <p>선택하신 <span>"{selectedGenre}"</span> 장르와 일치하는 결과가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchResult;