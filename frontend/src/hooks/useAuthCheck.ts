// src/hooks/useAuthCheck.ts
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      
      // ✨ 임시 이메일 감지 및 리다이렉트 로직
      if (user.email?.startsWith('kakao_') && location.pathname !== '/extra-info') {
        navigate('/extra-info');
      }
    }
  }, [location.pathname, navigate]);
};