import React, { useState, useEffect } from 'react';
import logo from '../../assets/img/Project_M_Logo_Dark.svg';

interface HeaderProps {
  onOpenLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  // 1. ✨ 닉네임 상태 관리
  const [nickname, setNickname] = useState<string | null>(null);

  // 2. ✨ 컴포넌트가 마운트될 때 로그인 정보 확인
  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  // 3. ✨ 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('nickname');
    localStorage.removeItem('token'); // 만약 토큰도 있다면 삭제
    setNickname(null);
    window.location.reload(); // 상태 반영을 위해 새로고침
  };

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="header-left">
        <a href="/" onClick={goHome} className="logo">
          <img src={logo} alt="Project M Logo" className="logo-img" />
        </a>
        <nav className="nav-menu">
          {/* ... 카테고리 메뉴 생략 ... */}
          <div className="category-parent">
            <span className="category-title">카테고리+</span>
            {/* 드롭다운 내용은 기존과 동일 */}
          </div>
          <a href="#ranking" className="nav-link">랭킹</a>
          <a href="#keyword" className="nav-link">키워드</a>
        </nav>
      </div>

      <div className="header-right">
        <input type="text" placeholder="검색어를 입력하세요" className="search-input" />
        
        {/* ✨ 4. 로그인 상태에 따른 조건부 렌더링 */}
        {nickname ? (
          <>
            <span className="user-nickname" style={{ marginRight: '15px', color: 'white' }}>
              <strong>{nickname}</strong>님
            </span>
            <button className="text-btn" onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <button className="text-btn" onClick={onOpenLogin}>로그인</button>
        )}
        
        <button className="btn-brand" onClick={() => nickname ? (window.location.href='/mypage') : onOpenLogin()}>
          마이페이지
        </button>
      </div>
    </header>
  );
};

export default Header;