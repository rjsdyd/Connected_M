import React from 'react';
<<<<<<< HEAD
import logo from '../../assets/img/Project_M_Logo.svg';
=======
import { useNavigate } from 'react-router-dom'; // ✨ 페이지 이동을 위한 훅 추가
>>>>>>> 3f696a6 (feat: register)

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const navigate = useNavigate(); // ✨ navigate 함수 꺼내기

  // 회원가입 페이지로 이동하는 함수
  const goToRegister = (e: React.MouseEvent) => {
    e.preventDefault(); // a 태그의 기본 이동(새로고침) 방지
    onClose();          // 1. 모달창 먼저 닫기
    navigate('/register'); // 2. 회원가입 페이지로 이동!
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
          <img src={logo} alt="Project M Logo" className="login_modal_logo-img" />
        <div className="modal-header">
          <p>반갑습니다! 로그인을 해주세요.</p>
        </div>
        
        <form className="login-form">
          {/* ... 이메일, 비밀번호 입력, 로그인 버튼 등 기존 코드 유지 ... */}
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
          {/* ✨ 여기에 goToRegister 함수 연결! */}
          <a href="#" onClick={goToRegister}>회원가입</a> 
        </div>

        <div className="social-login-section">
          <button className="social-btn btn-kakao">카카오</button>
          <button className="social-btn btn-google">구글</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;