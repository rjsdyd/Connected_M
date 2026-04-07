import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginModal from './components/common/LoginModal';
import Home from './pages/Home/Home';
import MyPage from './pages/MyPage/MyPage';
import Register from './pages/Register/Register';
import MovieDetail from './pages/MovieDetail/MovieDetail';




const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

      {/* ❌ 맨 아래에 있던 중복된 <Routes> 덩어리는 삭제했습니다. */}
    </BrowserRouter>
  );
};

export default App;