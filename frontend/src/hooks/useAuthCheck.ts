import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useAuthCheck = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 파라미터 추출 (예: ?token=... 또는 ?accessToken=...)
    const params = new URLSearchParams(location.search);
    
    // 백엔드 응답 변수명에 따라 유연하게 대처
    const token = params.get("token") || params.get("accessToken") || params.get("jwt"); 
    const nickname = params.get("nickname");

    // 디버깅: 주소창에 데이터가 들어오는지 확인
    if (location.search) {
      console.log("URL 파라미터 감지됨:", location.search);
    }

    if (token && token !== "undefined" && token !== "null") {
      console.log("토큰 저장 중:", token);
      
      // 로컬 스토리지 키 이름을 'token'으로 통일
      localStorage.setItem("token", token);
      
      if (nickname) {
        localStorage.setItem("nickname", decodeURIComponent(nickname));
      }
      
      // 저장 후 메인 페이지로 이동하며 상태 반영을 위해 새로고침
      navigate("/", { replace: true });
      window.location.reload();
    } else if (location.search.includes("token=undefined")) {
      console.error("오류: 백엔드에서 토큰을 undefined로 보냈습니다.");
    }
  }, [location, navigate]);
};