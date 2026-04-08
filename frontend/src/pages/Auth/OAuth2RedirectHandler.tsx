import { useEffect, useRef } from 'react'; // ✨ 1. useRef 추가

const OAuth2RedirectHandler = () => {
    // ✨ 2. 처리 완료 여부를 기억할 '도장' (리렌더링 시에도 유지됨)
    const hasProcessed = useRef(false);
    
    useEffect(() => {
        // 3. 만약 이미 도장이 찍혀있다면(true), 뒤도 돌아보지 말고 나감
        if (hasProcessed.current) return;

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const id = params.get('id');
        const nickname = params.get('nickname');
        const email = params.get('email');
        const needInfo = params.get('needInfo') === 'true'; 

        if (token) {
            // 4. ✨ 처리 시작하자마자 도장을 쾅! 찍습니다.
            hasProcessed.current = true;

            localStorage.setItem('token', token);
            localStorage.setItem('nickname', nickname || "사용자");

            const userObject = {
                id: id,
                nickname: nickname,
                email: email
            };
            localStorage.setItem('user', JSON.stringify(userObject));

            if (needInfo) {
                alert("정상적인 서비스 이용을 위해 전화번호 등록이 필요합니다.");
                window.location.href = "/extra-info"; 
            } else {
                window.location.href = "/"; 
            }
        } else {
            window.location.href = "/";
        }
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
            <p style={{ fontWeight: 'bold', color: '#4b0082' }}>로그인 인증 중...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;