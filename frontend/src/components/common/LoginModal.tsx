import React from 'react';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <div className="modal-header">
          <h2 style={{ color: '#4b0082' }}>💎 PRAYER</h2>
          <p>반갑습니다! 로그인을 해주세요.</p>
        </div>
        {/* 기존 폼 내용과 소셜 로그인 버튼 유지 */}
      </div>
    </div>
  );
};

export default LoginModal;