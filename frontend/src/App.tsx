import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // 상태 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [activeGenre, setActiveGenre] = useState('action');

  // 로고 클릭 시 홈으로 이동 (새로고침 없이 스크롤만 최상단으로)
  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 영화 데이터
  const movies: Record<string, string[]> = {
    action: ['블랙 위도우', '탑건: 매버릭', '존윅 4', '범죄도시 3', '미션 임파서블'],
    romance: ['어바웃 타임', '라라랜드', '노트북', '이프 온리', '비포 선라이즈'],
    horror: ['컨저링', '겟 아웃', '유전', '파묘', '콰이어트 플레이스'],
    comedy: ['극한직업', '행오버', '인턴', '수상한 그녀', '화이트 칙스'],
    sf: ['인터스텔라', '인셉션', '듄', '아바타', '매트릭스']
  };

  // 슬라이더 데이터
  const slideItems = [
    { id: 1, title: '추천 포스터 1', bg: '#c7d2fe', color: '#312e81', rating: 4.8 },
    { id: 2, title: '추천 포스터 2', bg: '#e9d5ff', color: '#581c87', rating: 4.5 },
    { id: 3, title: '추천 포스터 3', bg: '#bfdbfe', color: '#1e3a8a', rating: 4.9 },
    { id: 4, title: '추천 포스터 4', bg: '#bbf7d0', color: '#14532d', rating: 4.2 },
    { id: 5, title: '추천 포스터 5', bg: '#fecaca', color: '#7f1d1d', rating: 4.7 }
  ];

  // 자동 슬라이더 로직 (3.2초마다 넘어감, 마우스 올리면 일시정지)
  useEffect(() => {
    if (isSliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideItems.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isSliderPaused, slideItems.length]);

  const moveSlider = (direction: number) => {
    setCurrentSlide((prev) => (prev + direction + slideItems.length) % slideItems.length);
  };

  return (
    <div className="app-container">
      
      {/* ================= 1. 헤더 (Header) ================= */}
      <header className="header">
        <div className="header-left">
          {/* 로고 */}
          <a href="/" onClick={goHome} className="logo">
            <span className="logo-icon">💎</span> PRAYER
          </a>

          {/* 네비게이션 */}
          <nav className="nav-menu">
            <div className="category-parent">
              <span className="category-title">카테고리+</span>
              {/* 메가 드롭다운 메뉴 */}
              <div className="category-dropdown">
                <div className="dropdown-column">
                  <h4>영화</h4>
                  <p>최신 영화</p><p>개봉 예정</p><p>박스오피스</p>
                </div>
                <div className="dropdown-column">
                  <h4>TV 프로그램</h4>
                  <p>드라마</p><p>예능</p><p>애니메이션</p>
                </div>
                <div className="dropdown-column">
                  <h4>장르별</h4>
                  <p>액션/스릴러</p><p>로맨스</p><p>공포</p>
                </div>
                <div className="dropdown-column">
                  <h4>특별관</h4>
                  <p>IMAX</p><p>넷플릭스</p><p>디즈니+</p>
                </div>
              </div>
            </div>
            <a href="#ranking" className="nav-link">랭킹 키워드</a>
          </nav>
        </div>

        <div className="header-right">
          <input type="text" placeholder="검색어를 입력하세요" className="search-input" />
          <button className="text-btn" onClick={() => setIsLoginModalOpen(true)}>로그인</button>
          <button className="btn-brand">마이페이지</button>
        </div>
      </header>

      {/* ================= 2. 메인 배너 (Hero Section) ================= */}
      <section className="hero-section">
        <h1 className="hero-title">환영합니다. 인생작품을 찾아드립니다.</h1>
        <div className="hero-search-wrapper">
          <input type="text" className="hero-search" placeholder="어떤 작품을 찾고 계신가요?" />
          <button className="hero-search-btn">검색</button>
        </div>
      </section>

      {/* ================= 3. 키워드 섹션 ================= */}
      <section className="content-section">
        <h2 className="section-title"># 키워드</h2>
        <div className="keyword-grid">
          <div className="keyword-card">키워드 카드 영역</div>
          <div className="keyword-card">회의 후 확정 예정</div>
          <div className="keyword-card">카드 형식 배치</div>
          <div className="keyword-card">데이터 대기 중</div>
        </div>
      </section>

      {/* ================= 4. 오늘의 추천작 (슬라이더) ================= */}
      <section className="slider-section">
        <div className="slider-header-wrapper">
          <div className="slider-header">
            <h2 className="section-title">오늘의 추천작</h2>
            <div className="slider-controls">
              <button onClick={() => moveSlider(-1)}>◀</button>
              <button onClick={() => moveSlider(1)}>▶</button>
            </div>
          </div>
          
          <div 
            className="slider-container" 
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            <div 
              className="slider-track" 
              style={{ transform: `translateX(-${currentSlide * 320}px)` }}
            >
              {slideItems.map((item) => (
                <div key={item.id} className="slide-card" style={{ backgroundColor: item.bg }}>
                  <span style={{ color: item.color, fontWeight: 'bold' }}>{item.title}</span>
                  <div className="rating-badge">★ {item.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. 카테고리별 영화 ================= */}
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
                className={`genre-btn ${activeGenre === genre.id ? 'active' : ''}`}
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

      {/* ================= 푸터 ================= */}
      <footer className="footer">
        <p>푸터 영역 (나중에 정할 내용)</p>
        <div className="footer-links">
          <a href="#">회사소개</a><a href="#">이용약관</a><a href="#">개인정보처리방침</a><a href="#">고객센터</a>
        </div>
        <p className="copyright">copyright@prayer_meta</p>
      </footer>

      {/* ================= 챗봇 플로팅 버튼 ================= */}
      <div className="chatbot-toggle">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      </div>

      {/* ================= 로그인 모달 (수정 금지 요청 사항 그대로 유지) ================= */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsLoginModalOpen(false)}>✕</button>
            <div className="modal-header">
              <h2 style={{ color: '#4b0082' }}>💎 PRAYER</h2>
              <p>반갑습니다! 로그인을 해주세요.</p>
            </div>
            <form className="login-form">
              <div className="input-group">
                <label>이메일</label>
                <input type="email" placeholder="example@email.com" />
              </div>
              <div className="input-group">
                <label>비밀번호</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <button type="submit" className="submit-btn">로그인하기</button>
            </form>

            <div className="modal-links">
              <a href="#">비밀번호 찾기</a>
              <span className="divider">•</span>
              <a href="#">회원가입</a>
            </div>

            <div className="social-login-section">
              <button className="social-btn btn-kakao">카카오</button>
              <button className="social-btn btn-naver">네이버</button>
              <button className="social-btn btn-google">구글</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;