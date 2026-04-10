// useAuthCheck.tsx 수정
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useAuthCheck = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    if (!location.pathname.includes('/oauth2/redirect')) {
      return; 
    }

    const params = new URLSearchParams(location.search);
    const token = params.get("token") || params.get("accessToken") || params.get("jwt"); 
    const nickname = params.get("nickname");
    const needInfo = params.get("needInfo"); // ✨ 추가 정보 필요 여부 확인

    if (token && token !== "undefined" && token !== "null") {
      // 1. 토큰 및 정보 저장
      localStorage.setItem("token", token);
      if (nickname) {
        localStorage.setItem("nickname", decodeURIComponent(nickname));
      }

      // 🚨 [핵심 수정] 추가 정보가 필요한 경우 (needInfo가 true일 때)
      if (needInfo === "true") {
        console.log("추가 정보 입력 필요: /extra-info로 이동");
        // /extra-info로 보낼 때는 여기서 새로고침하지 말고 그냥 이동만 시킵니다.
        navigate("/extra-info", { replace: true });
        return; // 여기서 로직 종료 (홈으로 보내는 navigate 실행 방지)
      }

      // 2. 추가 정보가 필요 없는 경우만 홈으로 이동
      console.log("인증 완료: 메인으로 이동");
      navigate("/", { replace: true });
      window.location.reload();
    }
  }, [location, navigate]);
};