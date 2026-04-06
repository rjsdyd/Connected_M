import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/img/Project_M_Logo_Dark.png';
import { FaPlus } from "react-icons/fa";

interface HeaderProps {
  onOpenLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  // ✨ 수정된 로그아웃 함수
  const handleLogout = () => {
    // 1. 지갑 비우기 (아까 추가했던 user도 꼭 같이 지워주세요!)
    localStorage.removeItem('user'); 
    localStorage.removeItem('nickname');
    localStorage.removeItem('token');
    
    // 2. 상태 초기화 및 알림
    setNickname(null);
    alert("로그아웃 되었습니다.");
    
    // 3. 어디에 있든 무조건 메인 홈으로 쫓아내기
    navigate('/');
    
    // 4. 화면 새로고침으로 완벽하게 상태 반영
    window.location.reload();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="header-inner">
        
        <div className="header-left">
          <a href="/" onClick={handleLogoClick} className="logo">
            <img src={logo} alt="Project_M_Logo" className="logo-img" />
          </a>
          <nav className="nav-menu">
            <div className="category-parent">
              <span className="category-title">카테고리 <FaPlus /></span>
              <div className="category-dropdown">
                <div className="dropdown-column">
                  <h4>영화</h4>
                  <p>최신 영화</p><p>개봉 예정</p><p>박스오피스</p>
                </div>
                <div className="dropdown-column">
                  <h4>장르</h4>
                  <p>드라마</p><p>범죄/스릴러</p><p>애니메이션</p><p>액션</p><p>코미디</p>
                </div>
              </div>
            </div>
            <a href="#ranking" className="nav-link">랭킹</a>
            <a href="#keyword" className="nav-link">키워드</a>
          </nav>
        </div>

        <div className="header-right">
          <input type="text" placeholder="검색어를 입력하세요" className="search-input" />
          
          {/* 로그인 상태에 따른 버튼 렌더링 (아주 잘 짜셨습니다!) */}
          {nickname ? (
            <div className="user-info">
              <span className="user-nickname">
                <strong>{nickname}</strong>님
              </span>
              <button className="text-btn" onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <button className="text-btn" onClick={onOpenLogin}>로그인</button>
          )}
          
          <button 
            className="btn-brand" 
            onClick={() => nickname ? navigate('/mypage') : onOpenLogin()}
          >
            마이페이지
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;