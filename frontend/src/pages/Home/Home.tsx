import React, { useState, useEffect } from 'react';
import './Home.css'

const Home = () => {
  // ================= 1. 상태 관리 =================
  const [activeGenre, setActiveGenre] = useState<string>('action');
  const [currentSlide, setCurrentSlide] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // ================= 2. 영화 & 슬라이더 데이터 =================
  const movies: Record<string, string[]> = {
    action: ['블랙 위도우', '탑건: 매버릭', '존윅 4', '범죄도시 3', '미션 임파서블'],
    romance: ['어바웃 타임', '라라랜드', '노트북', '이프 온리', '비포 선라이즈'],
    horror: ['컨저링', '겟 아웃', '유전', '파묘', '콰이어트 플레이스'],
    comedy: ['극한직업', '행오버', '인턴', '수상한 그녀', '화이트 칙스'],
    sf: ['인터스텔라', '인셉션', '듄', '아바타', '매트릭스']
  };

  const slideItems = [
    { id: 1, title: '추천 포스터 1', bg: '#c7d2fe', color: '#312e81', rating: 4.8 },
    { id: 2, title: '추천 포스터 2', bg: '#e9d5ff', color: '#581c87', rating: 4.5 },
    { id: 3, title: '추천 포스터 3', bg: '#bfdbfe', color: '#1e3a8a', rating: 4.9 },
    { id: 4, title: '추천 포스터 4', bg: '#bbf7d0', color: '#14532d', rating: 4.2 },
    { id: 5, title: '추천 포스터 5', bg: '#fecaca', color: '#7f1d1d', rating: 4.7 }
  ];

  const extendedSlides = [
    ...slideItems.map(item => ({ ...item, uniqueId: `prev-${item.id}` })),
    ...slideItems.map(item => ({ ...item, uniqueId: `curr-${item.id}` })),
    ...slideItems.map(item => ({ ...item, uniqueId: `next-${item.id}` }))
  ];

  // ================= 3. 무한 슬라이더 로직 =================
  useEffect(() => {
    if (currentSlide === 10) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(5);
      }, 500); 
    } else if (currentSlide === 4) {
      setTimeout(() => {
        setIsTransitioning(false); 
        setCurrentSlide(9);
      }, 500);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (isSliderPaused) return;
    const interval = setInterval(() => {
      if (isTransitioning) setCurrentSlide(prev => prev + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, [isSliderPaused, isTransitioning]);

  const moveSlider = (direction: number) => {
    if (!isTransitioning) return;
    setCurrentSlide((prev) => prev + direction);
  };

  // ================= 4. 화면 렌더링 (JSX) =================
  return (
    <main>
      {/* ---------------- 메인 배너 ---------------- */}
      <section className="hero-section">
        <h1 className="hero-title">환영합니다. 인생작품을 찾아드립니다.</h1>
        <div className="hero-search-wrapper">
          <input type="text" className="hero-search" placeholder="어떤 작품을 찾고 계신가요?" />
          <button className="hero-search-btn">검색</button>
        </div>
      </section>

      {/* ---------------- 키워드 섹션 ---------------- */}
      <section className="content-section">
        <h2 className="section-title"># 키워드</h2>
        <div className="keyword-grid">
          <div className="keyword-card">키워드 카드 영역</div>
          <div className="keyword-card">회의 후 확정 예정</div>
          <div className="keyword-card">카드 형식 배치</div>
          <div className="keyword-card">데이터 대기 중</div>
        </div>
      </section>

      {/* ---------------- 오늘의 추천작 (슬라이더) ---------------- */}
      <section className="slider-section" style={{ padding: '48px 0', background: '#f9fafb' }}>
        <div className="slider-header-wrapper" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <h2 className="section-title" style={{ marginBottom: '24px' }}>오늘의 추천작</h2>
          
          <div 
            className="slider-flex-wrapper" 
            style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            <button 
              onClick={() => moveSlider(-1)}
              style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: 'white', border: '1px solid #e5e7eb', color: '#4b0082', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ◀
            </button>
            
            <div className="slider-container" style={{ overflow: 'hidden', flex: 1 }}>
              <div 
                className="slider-track" 
                style={{ 
                  display: 'flex',
                  transform: `translateX(-${currentSlide * 320}px)`, 
                  transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                }}
              >
                {extendedSlides.map((item) => (
                  <div key={item.uniqueId} className="slide-card" style={{ flex: '0 0 300px', height: '400px', margin: '0 10px', backgroundColor: item.bg, borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: item.color, fontWeight: 'bold' }}>{item.title}</span>
                    <div className="rating-badge" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      ★ {item.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => moveSlider(1)}
              style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: 'white', border: '1px solid #e5e7eb', color: '#4b0082', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ▶
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 카테고리별 영화 ---------------- */}
      <section className="content-section">
        <div className="category-header">
          <h2 className="section-title">카테고리별 영화</h2>
          <div className="genre-tabs">
            {[
              { id: 'action', label: '액션' },
              { id: 'romance', label: '로맨스' },
              { id: 'horror', label: '공포' },
              { id: 'comedy', label: '코미디' },
              { id: 'sf', label: 'SF' }
            ].map(genre => (
              <button 
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                  background: activeGenre === genre.id ? '#4b0082' : 'white',
                  color: activeGenre === genre.id ? 'white' : '#6b7280',
                  border: activeGenre === genre.id ? '1px solid #4b0082' : '1px solid #d1d5db',
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        <div className="movie-grid">
          {movies[activeGenre].map((movie, i) => (
            <div key={i} className="movie-item">
              <div className="movie-poster">
                <span>포스터 이미지 {i + 1}</span>
                <div className="movie-rating">★ 4.{9 - i}</div>
              </div>
              <p className="movie-title">{movie}</p>
              <p className="movie-info">2024 • 영화</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;