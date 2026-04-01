import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // ✨ 라우터 기능 불러오기
import './App.css';

// 📦 분리한 컴포넌트들 불러오기
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginModal from './components/common/LoginModal';
import Home from './pages/Home/Home';
import MyPage from './pages/MyPage/MyPage';
import Register from './pages/Register/Register';

const App = () => {
  // 로그인 모달 상태는 전체 화면에서 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    // ✨ 전체 앱을 BrowserRouter로 감싸줍니다.
    <BrowserRouter>
      <div className="app-container">
        {/* 1. 상단 헤더 (모든 페이지 고정) */}
        <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
        
        {/* 2. 메인 페이지 컨텐츠 (✨ 주소에 따라 화면이 바뀌는 영역!) */}
        <div className="main-content" style={{ minHeight: '80vh' }}> 
          <Routes>
            {/* 기본 주소('/')로 오면 Home을 보여줌 */}
            <Route path="/" element={<Home />} />

            <Route path="/register" element={<Register />} />
            
            {/* '/mypage' 주소로 오면 MyPage를 보여줌 */}
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
        
        {/* 3. 하단 푸터 (모든 페이지 고정) */}
        <Footer />
        
        {/* 4. 우측 하단 챗봇 (모든 페이지 고정) */}
        <Chatbot />
        
        {/* 5. 로그인 모달 */}
        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;