import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { fetchPopularMovies } from '../../api/tmdb'; 

const Home = () => {
  const navigate = useNavigate();
  // TMDB 실제 장르 ID (액션: 28, 드라마: 18, 범죄: 80, 코미디: 35, 애니메이션: 16)
  const [activeGenre, setActiveGenre] = useState<number>(28); 
  const [currentMovies, setCurrentMovies] = useState<any[]>([]);
  const [slideItems, setSlideItems] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0); // 0번부터 시작하도록 수정
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // 환경 변수 확인용
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

  // ================= 2. API 데이터 로드 =================

  // 1. 추천작 슬라이더용 데이터 (인기 영화)
  useEffect(() => {
    const loadHeroMovies = async () => {
      try {
        const movies = await fetchPopularMovies();
        if (movies && movies.length > 0) {
          setSlideItems(movies.slice(0, 5)); // 상위 5개 사용
        }
      } catch (error) {
        console.error("추천작 로드 실패:", error);
      }
    };
    loadHeroMovies();
  }, []);

  // 2. 카테고리별 영화 데이터 로드 (장르 선택 시마다 실행)
  useEffect(() => {
    const loadGenreMovies = async () => {
      if (!BASE_URL || !API_KEY) return;
      
      try {
        // fetch 요청 시 API_KEY를 쿼리 파라미터로 명확히 전달
        const response = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${activeGenre}&language=ko-KR&sort_by=popularity.desc`
        );
        const data = await response.json();
        if (data.results) {
          setCurrentMovies(data.results);
        }
      } catch (error) {
        console.error("장르 영화 로드 실패:", error);
      }
    };
    loadGenreMovies();
  }, [activeGenre, BASE_URL, API_KEY]);

  // ================= 3. 슬라이더 & 이벤트 로직 =================
  useEffect(() => {
    if (isSliderPaused || slideItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideItems.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isSliderPaused, slideItems.length]);

  const moveSlider = (direction: number) => {
    if (slideItems.length === 0) return;
    setCurrentSlide((prev) => (prev + direction + slideItems.length) % slideItems.length);
  };

  const getSlideStyle = (index: number) => {
    if (slideItems.length === 0) return { display: 'none' };
    const diff = index - currentSlide;
    let offset = diff;
    if (diff > 2) offset = diff - slideItems.length;
    if (diff < -2) offset = diff + slideItems.length;
    const absOffset = Math.abs(offset);
    const isActive = offset === 0;

    return {
      transform: `translateX(${offset * 220}px) scale(${1 - absOffset * 0.2})`,
      zIndex: 10 - absOffset,
      opacity: isActive ? 1 : absOffset === 1 ? 0.6 : 0,
      transition: 'all 0.5s ease-in-out',
      position: 'absolute' as const,
      visibility: absOffset > 1 ? 'hidden' as const : 'visible' as const,
    };
  };

  const handleSlideClick = (index: number, id: number) => {
    if (index === currentSlide) {
      navigate(`/movie/${id}`);
    } else {
      setCurrentSlide(index);
    }
  };

  // 터치/마우스 스와이프 로직
  const onTouchStart = (e: any) => { setTouchEnd(null); const clientX = e.touches ? e.touches[0].clientX : e.clientX; setTouchStart(clientX); };
  const onTouchMove = (e: any) => { const clientX = e.touches ? e.touches[0].clientX : e.clientX; setTouchEnd(clientX); };
  const onTouchEnd = () => { if (touchStart === null || touchEnd === null) return; const distance = touchStart - touchEnd; if (distance > minSwipeDistance) moveSlider(1); else if (distance < -minSwipeDistance) moveSlider(-1); setTouchStart(null); setTouchEnd(null); };

  return (
    <main className="home-container">
      <section className="hero-section">
  
        <h1 className="hero-title">환영합니다. 인생작품을 찾아드립니다.</h1>
        <div className="hero-search-wrapper">
          <input type="text" className="hero-search" placeholder="어떤 작품을 찾고 계신가요?" />
          <button className="hero-search-btn">검색</button>
        </div>
      </section>

      <section className="slider-section">
        <div className="slider-header-wrapper">
          <h2 className="section-title">오늘의 추천작</h2>
          <div 
            className="slider-3d-wrapper" 
            onMouseEnter={() => setIsSliderPaused(true)} 
            onMouseLeave={() => setIsSliderPaused(false)} 
            onMouseDown={onTouchStart}
            onMouseMove={(e) => touchStart && onTouchMove(e)}
            onMouseUp={onTouchEnd}
          >
            <button className="nav-btn-3d left" onClick={() => moveSlider(-1)}>◀</button>
            <div className="slider-3d-container">
              {slideItems.length > 0 ? slideItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="slide-card-3d" 
                  style={getSlideStyle(index)} 
                  onClick={() => handleSlideClick(index, item.id)}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                  />
                </div>
              )) : <div className="loading">추천 영화를 불러오는 중...</div>}
            </div>
            <button className="nav-btn-3d right" onClick={() => moveSlider(1)}>▶</button>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="category-header">
          <h2 className="section-title">카테고리별 영화</h2>
          <div className="genre-tabs">
            {[
              { id: 28, label: '액션' },
              { id: 18, label: '드라마' },
              { id: 80, label: '범죄' },
              { id: 35, label: '코미디' },
              { id: 16, label: '애니' }
            ].map(genre => (
              <button 
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`genre-btn ${activeGenre === genre.id ? 'active' : ''}`}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold',
                  background: activeGenre === genre.id ? '#4b0082' : 'white',
                  color: activeGenre === genre.id ? 'white' : '#6b7280',
                  border: '1px solid #d1d5db', marginRight: '8px'
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        <div className="movie-grid">
          {currentMovies.length > 0 ? currentMovies.map((movie) => (
            <div key={movie.id} className="movie-item" onClick={() => navigate(`/movie/${movie.id}`)}>
              <div className="movie-poster">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} 
                />
              </div>
              <p className="movie-title_main">{movie.title}</p>
              <p className="movie-info">{movie.release_date?.split('-')[0] || '개봉일 미정'}</p>
            </div>
          )) : <div className="loading">영화를 불러오는 중입니다...</div>}
        </div>
      </section>
    </main>
  );
};

export default Home;