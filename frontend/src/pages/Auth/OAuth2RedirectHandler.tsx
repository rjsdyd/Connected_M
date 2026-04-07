import { useEffect } from 'react';

const OAuth2RedirectHandler = () => {
    
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const id = params.get('id');
    const nickname = params.get('nickname');
    const email = params.get('email'); // ✨ 1. 주소창에서 email을 꺼냅니다!

    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('nickname', nickname || "사용자");

        // ✨ 2. userObject에 email을 반드시 포함시켜야 App.tsx가 감지합니다.
        const userObject = {
            id: id,
            nickname: nickname,
            email: email // ◀ 이게 빠져있어서 안 됐던 거예요!
        };
        localStorage.setItem('user', JSON.stringify(userObject));

        window.location.href = "/"; 
    } else {
        window.location.href = "/";
    }
}, []);

    // 처리되는 아주 짧은 찰나에 보여줄 화면 (거의 안 보입니다)
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
            <p style={{ fontWeight: 'bold', color: '#4b0082' }}>로그인 인증 중...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;