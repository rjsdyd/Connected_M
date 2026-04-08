import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// 컴포넌트 & 페이지 임포트
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginModal from './components/common/LoginModal';
import { useAuthCheck } from './hooks/useAuthCheck';

// 페이지들
import Home from './pages/Home/Home';
import MyPage from './pages/MyPage/MyPage';
import Register from './pages/Register/Register';
import MovieDetail from './pages/MovieDetail/Moviedetail';
import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';
import ExtraInfo from './pages/Auth/ExtraInfo';

const AppContent = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // ✨ 이제 부모인 <App>이 BrowserRouter를 감싸고 있어서 이 훅이 정상 작동합니다!
  useAuthCheck();

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 1. 상단 헤더 */}
        <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
        
        {/* 2. 메인 콘텐츠 영역 (모든 Route는 이 안으로 모아야 합니다) */}
        <div className="main-content" style={{ minHeight: '80vh' }}> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            {/* 상세페이지 경로 - 반드시 여기에 위치해야 합니다 */}
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/terms" element={<Terms />} /> 
            <Route path="/privacy" element={<Privacy />} />



          </Routes>
        </div>
        
        {/* 3. 하단 푸터 */}
        <Footer />
        
        {/* 4. 챗봇 */}
        <Chatbot />
        
        {/* 5. 로그인 모달 */}
        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
      </div>

    </BrowserRouter>
  );
};
    {/* </BrowserRouter> */}


// 최상단에서 한 번만 감싸줍니다.
const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;