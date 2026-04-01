import React, { useState } from 'react';
import './App.css';

// 📦 분리한 컴포넌트들 불러오기
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginModal from './components/common/LoginModal';
import Home from './pages/Home/Home';

const App = () => {
  // 로그인 모달 상태는 전체 화면에서 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* 1. 상단 헤더 (로그인 버튼 클릭 시 모달 열기 함수 전달) */}
      <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
      
      {/* 2. 메인 페이지 컨텐츠 */}
      <Home />
      
      {/* 3. 하단 푸터 */}
      <Footer />
      
      {/* 4. 우측 하단 챗봇 */}
      <Chatbot />
      
      {/* 5. 로그인 모달 (상태가 true일 때만 렌더링) */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </div>
  );
};

export default App;