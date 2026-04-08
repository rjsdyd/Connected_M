import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Footer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const teamMembers = [
    { id: 1, name: 'Member 1', github: 'https://github.com/LMJ-01', img: '/image/KakaoTalk_20260407_100625430.png', color: '#fbbf24' },
    { id: 2, name: 'Member 2', github: 'https://github.com/Joohang', img: '/image/KakaoTalk_20260407_100625430_01.png', color: '#60a5fa' },
    { id: 3, name: 'Member 3', github: 'https://github.com/rjsdyd', img: '/image/KakaoTalk_20260407_100625430_02.png', color: '#f472b6' },
    { id: 4, name: 'Member 4', github: 'https://github.com/Sleep404NF', img: '/image/KakaoTalk_20260407_100625430_03.png', color: '#e5e7eb' },
    { id: 5, name: 'Member 5', github: 'https://github.com/dnwls0022', img: '/image/KakaoTalk_20260407_100625430_04.png', color: '#4b5563' },
  ];

  const goToUrl = (url: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <footer style={{ width: '100%', backgroundColor: '#eeeeee', padding: '40px 20px', borderTop: '1px solid #ddd', color: '#333', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* 1. 팀 로고 */}
        <div onClick={() => navigateTo('/')} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <img src="/image/화면_캡처_2026-04-07_110635-removebg-preview (2).png" alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
        </div>

        {/* 2. 중앙 텍스트 정보 */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>이 사이트는 TMDB와 씨네21 데이터를 기반으로 하여 제작되었습니다.</p>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>이윤을 추구하지않는 비영리 프로젝트로써 <span style={{ color: '#5b21b6', fontWeight: 'bold' }}>Connected_M</span>은 무료입니다.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
             <span style={{ color: '#01b4e4', fontWeight: '900', cursor: 'pointer' }} onClick={() => goToUrl('https://www.themoviedb.org/')}>TMDB</span>
             <span style={{ fontWeight: '900', cursor: 'pointer' }} onClick={() => goToUrl('http://www.cine21.com/')}>씨네<span style={{ color: 'red' }}>21</span></span>
          </div>
        </div>

        {/* 3. 오른쪽 팀원 & 링크 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
          {/* 팀원 아이콘 겹치기 효과 */}
          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                onClick={() => goToUrl(member.github)}
                style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', border: `3px solid ${member.color}`, 
                  backgroundColor: 'white', overflow: 'hidden', marginLeft: '-15px', cursor: 'pointer', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: '0.2s' 
                }}
              >
                <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '14px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span onClick={() => navigateTo('/terms')} style={{ cursor: 'pointer', marginRight: '15px', fontWeight: '600' }}>이용약관</span>
              <span onClick={() => navigateTo('/privacy')} style={{ cursor: 'pointer', fontWeight: '600' }}>개인정보처리방침</span>
            </div>
            <p onClick={() => setIsModalOpen(true)} style={{ color: '#666', cursor: 'pointer' }}>© 2026 Connected_M ⓘ</p>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Connected_M </h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>안녕하세요! Connected_M은 OTT 시대에 사용자에게 최적화된 콘텐츠 분석을 제공하기 위해 시작된 비상업적 서비스입니다</p>
            <button onClick={() => setIsModalOpen(false)} style={{ width: '100%', padding: '10px', backgroundColor: '#5b21b6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>닫기</button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;