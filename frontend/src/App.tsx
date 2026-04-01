import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 타입 정의 (타입스크립트 환경을 위해 추가)
interface ChatMessage {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

const App = () => {
  // ================= 1. 기존 상태 관리 =================
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string>('action');
  
  const [currentSlide, setCurrentSlide] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // ================= 2. 챗봇 전용 상태 관리 =================
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      type: 'bot', 
      text: '<strong>반갑습니다! 👋</strong><br> 궁금한 영화나 드라마가 있다면 무엇이든 물어보세요.' 
    }
  ]);
  const chatBodyRef = useRef<HTMLDivElement>(null); 

  // ✨ [여기서부터 추가!] 챗봇 모달과 버튼의 위치를 기억할 Ref
  const chatModalRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLDivElement>(null);

  // ✨ 바깥 화면 클릭 시 모달창 닫기 로직
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 챗봇이 열려있고, 클릭한 곳이 모달창 내부가 아니고, 버튼도 아닐 때 닫음
      if (
        isChatOpen &&
        chatModalRef.current && !chatModalRef.current.contains(e.target as Node) &&
        chatButtonRef.current && !chatButtonRef.current.contains(e.target as Node)
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  // ================= 3. 기존 데이터 및 로직 =================
  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // 무한 슬라이더 로직
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

  // ================= 4. 챗봇 전용 로직 =================
  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // 사용자 메시지 화면에 추가
    const newMsg: ChatMessage = { id: Date.now(), type: 'user', text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // 임시 봇 응답 (추후 Gemini API 연동 위치)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: `'${newMsg.text}'에 대한 맞춤 영화를 찾고 있습니다... 🍿` 
      }]);
    }, 800);
  };

  // 엔터키 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 메시지 업데이트 시 자동 스크롤 하단 이동
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className="app-container">
      
      {/* ================= 헤더 ================= */}
      <header className="header">
        <div className="header-left">
          <a href="/" onClick={goHome} className="logo">
            <span className="logo-icon">💎</span> PRAYER
          </a>
          <nav className="nav-menu">
            <div className="category-parent">
              <span className="category-title">카테고리+</span>
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

      {/* ================= 메인 배너 ================= */}
      <section className="hero-section">
        <h1 className="hero-title">환영합니다. 인생작품을 찾아드립니다.</h1>
        <div className="hero-search-wrapper">
          <input type="text" className="hero-search" placeholder="어떤 작품을 찾고 계신가요?" />
          <button className="hero-search-btn">검색</button>
        </div>
      </section>

      {/* ================= 키워드 섹션 ================= */}
      <section className="content-section">
        <h2 className="section-title"># 키워드</h2>
        <div className="keyword-grid">
          <div className="keyword-card">키워드 카드 영역</div>
          <div className="keyword-card">회의 후 확정 예정</div>
          <div className="keyword-card">카드 형식 배치</div>
          <div className="keyword-card">데이터 대기 중</div>
        </div>
      </section>

      {/* ================= 오늘의 추천작 (슬라이더) ================= */}
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

      {/* ================= 카테고리별 영화 ================= */}
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

      {/* ================= 푸터 ================= */}
      <footer className="footer">
        <p>푸터 영역 (나중에 정할 내용)</p>
        <div className="footer-links">
          <a href="#">회사소개</a><a href="#">이용약관</a><a href="#">개인정보처리방침</a><a href="#">고객센터</a>
        </div>
        <p className="copyright">copyright@prayer_meta</p>
      </footer>

      {/* ================= 챗봇 플로팅 버튼 ================= */}
      <div 
        className="chatbot-toggle" 
        ref={chatButtonRef} /* ✨ 1. 버튼 ref 달아주기 */
        onClick={(e) => {
          e.preventDefault();
          setIsChatOpen(!isChatOpen); /* ✨ 2. true 대신 !isChatOpen으로 변경 (누를 때마다 열림/닫힘 반복) */
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      </div>

      {/* ================= 챗봇 모달창 ================= */}
      {isChatOpen && (
        <div className="chatbot-modal" ref={chatModalRef}> {/* ✨ 여기에 ref={chatModalRef} 추가! */}
          <div className="chat-header">
              <h3>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z"/></svg>
                  Gemini 스마트 비서
              </h3>
              <span style={{ cursor: 'pointer', fontSize: '28px' }} onClick={() => setIsChatOpen(false)}>&times;</span>
          </div>
          
          <div className="chat-body" ref={chatBodyRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-msg ${msg.type}-msg`}>
                  {msg.type === 'bot' ? (
                    <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
          </div>
          
          <div className="chat-input-area">
              <input 
                type="text" 
                className="chat-input-field" 
                placeholder="여기에 질문을 입력하세요..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button className="chat-send-btn" onClick={handleSendMessage}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
          </div>
        </div>
      )}

      {/* ================= 로그인 모달 ================= */}
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
              <button className="social-btn btn-google">구글</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;