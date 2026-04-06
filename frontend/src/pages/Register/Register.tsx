import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import logo from '../../assets/img/Project_M_Logo.png'

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    realName: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: ''
  });

  // ✨ 함수형 업데이트로 변경하여 안정성 강화
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { passwordConfirm, ...signupData } = formData;
      // 백엔드 포트(8080)와 엔드포인트(/api/auth/signup) 확인
      await axios.post('http://localhost:8080/api/auth/signup', signupData);
      
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.';
      alert(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src={logo} alt="Project_M_Logo" className="login_modal_logo-img" />
          <p className="register-subtitle">당신의 인생 작품을 기록할 준비가 되셨나요?</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label>이름</label>
            <input 
              type="text" 
              name="realName" 
              value={formData.realName} 
              onChange={handleChange} 
              autoComplete="off" 
              required 
              placeholder="성함을 입력해주세요" 
            />
          </div>

          <div className="input-group">
            <label>닉네임</label>
            <input 
              type="text" 
              name="nickname" 
              value={formData.nickname} 
              onChange={handleChange} 
              autoComplete="off" 
              required 
              placeholder="사용하실 닉네임을 입력해주세요" 
            />
          </div>

          <div className="input-group">
            <label>이메일</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              autoComplete="email" 
              required 
              placeholder="example@email.com" 
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              autoComplete="new-password" 
              required 
              placeholder="8자 이상의 비밀번호" 
            />
          </div>

          <div className="input-group">
            <label>비밀번호 확인</label>
            <input 
              type="password" 
              name="passwordConfirm" 
              value={formData.passwordConfirm} 
              onChange={handleChange} 
              autoComplete="new-password" 
              required 
              placeholder="비밀번호를 다시 입력해주세요" 
            />
          </div>

          <div className="input-group">
            <label>전화번호</label>
            <input 
              type="text" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              autoComplete="tel" 
              placeholder="010-0000-0000" 
            />
          </div>

          <button type="submit" className="btn-submit">회원가입 완료</button>
        </form>

        <div className="register-footer">
          이미 계정이 있으신가요? <span className="login-link" onClick={() => navigate('/')}>로그인하기</span>
        </div>
      </div>
    </div>
  );
};

export default Register;