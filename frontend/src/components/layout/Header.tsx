import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 추가
import logo from '../../assets/img/Project_M_Logo_Dark.png';
import { FaPlus } from "react-icons/fa";

interface HeaderProps {
  onOpenLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const navigate = useNavigate(); // 추가

  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nickname');
    localStorage.removeItem('token');
    setNickname(null);
    window.location.reload();
  };

  // 로고 클릭 시 메인으로 이동 + 부드럽게 위로
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/'); // 메인 경로로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      {/* ✨ 중앙 정렬을 위한 컨테이너 추가 */}
      <div className="header-inner">
        
        <div className="header-left">
          <a href="/" onClick={handleLogoClick} className="logo">
            <img src={logo} alt="Project M Logo" className="logo-img" />
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