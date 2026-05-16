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
    const error = params.get("error");
    if (error === "BANNED") {
      alert("운영 원칙 위반으로 해당 계정은 정지되었습니다. 관리자에게 문의하세요.");
      localStorage.removeItem("token");
      navigate("/", { replace: true });
      return;
    }

    const token = params.get("token") || params.get("accessToken") || params.get("jwt"); 
    const nickname = params.get("nickname");
    const needInfo = params.get("needInfo"); 

    // 2. 정상 로그인 처리
    if (token && token !== "undefined" && token !== "null") {
      localStorage.setItem("token", token);
      if (nickname) {
        localStorage.setItem("nickname", decodeURIComponent(nickname));
      }

      if (needInfo === "true") {
        console.log("추가 정보 입력 필요: /extra-info로 이동");
        navigate("/extra-info", { replace: true });
        return;
      }

      console.log("인증 완료: 메인으로 이동");
      navigate("/", { replace: true });
      window.location.reload();
    }
  }, [location, navigate]);
};