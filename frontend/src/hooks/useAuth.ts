import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");

    // 단순 존재 여부뿐만 아니라 'undefined' 문자열이 저장되는 경우까지 방지
    if (token && token !== "undefined" && token !== "null") {
      setIsLoggedIn(true);
      setUserNickname(nickname);
    } else {
      setIsLoggedIn(false);
      setUserNickname(null);
    }
  }, []);

  return { isLoggedIn, userNickname };
};