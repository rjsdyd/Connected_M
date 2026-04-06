import React, { useState } from 'react'; // useState 추가
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios 추가
import logo from '../../assets/img/Project_M_Logo.png'
import './LoginModal.css'

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  
  // 1. ✨ 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. ✨ 로그인 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email,
      password
    });

    console.log("서버 응답 확인:", response.data);

    // ✨ 데이터 위치를 유연하게 찾는 로직
    const data = response.data.data ? response.data.data : response.data;
    const nick = data.nickname;
    const token = data.token || data.accessToken;

    if (nick) {
      localStorage.setItem('nickname', nick);
      localStorage.setItem('token', token);

      localStorage.setItem('user', JSON.stringify(data));
      
      alert(`${nick}님, 환영합니다!`);
      onClose();
      window.location.reload(); 
    } else {
      console.error("닉네임을 찾을 수 없습니다. 콘솔에 찍힌 객체 구조를 확인하세요.");
    }
  } catch (error) {
    console.error('로그인 실패:', error);
    alert('아이디 또는 비밀번호가 틀렸습니다.');
  }
};

  const goToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    navigate('/register');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <img src={logo} alt="Project_M_Logo" className="login_modal_logo-img" />
        <div className="modal-header">
          <p>반갑습니다! 로그인을 해주세요.</p>
        </div>
        
        {/* 4. ✨ onSubmit 연결 및 value/onChange 설정 */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>이메일</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">로그인하기</button>
        </form>

        <div className="modal-links">
          <a href="#">비밀번호 찾기</a>
          <span className="divider">•</span>
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