import React, { useEffect, useState } from 'react';

const App = () => {
  // 백엔드에서 받아올 데이터를 저장할 상태(State)
  const [todayMovieMsg, setTodayMovieMsg] = useState<string>('');

  useEffect(() => {
    // 컴포넌트가 화면에 나타날 때 백엔드(8080 포트)로 GET 요청을 보냅니다.
    fetch('http://localhost:8080/api/movies/today')
      .then((response) => response.text()) // 백엔드에서 텍스트를 리턴하고 있으므로 text() 사용
      .then((data) => {
        console.log("백엔드에서 온 데이터:", data);
        setTodayMovieMsg(data); // 상태에 저장
      })
      .catch((error) => {
        console.error("통신 에러 발생:", error);
        setTodayMovieMsg("백엔드 서버와 연결할 수 없습니다 😭");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-[#4b0082] mb-6">
          React ↔ Spring Boot 연결 테스트
        </h1>
        
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-400 mb-2">백엔드(/api/movies/today) 응답 결과:</p>
          {/* 백엔드에서 받아온 데이터가 이곳에 출력됩니다 */}
          <p className="text-lg font-bold text-gray-800">
            {todayMovieMsg ? todayMovieMsg : '데이터를 불러오는 중... 로딩중 ⏳'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;