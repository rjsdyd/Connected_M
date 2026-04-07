import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

interface ChatMessage {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, type: 'bot', text: '<strong>반갑습니다! 👋</strong><br> 궁금한 영화가 있다면 무엇이든 물어보세요.' }
  ]);
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatModalRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // 입력창 포커스용

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isChatOpen &&
        chatModalRef.current && !chatModalRef.current.contains(e.target as Node) &&
        chatButtonRef.current && !chatButtonRef.current.contains(e.target as Node)
      ) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChatOpen]);

  // 메시지 전송
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMsgId = Date.now();
    const newMsg: ChatMessage = { id: userMsgId, type: 'user', text: chatInput };
    
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    
    // 메시지 전송 후 다시 포커스
    setTimeout(() => inputRef.current?.focus(), 0);

    // 봇 답변 시뮬레이션
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: userMsgId + 1, 
        type: 'bot', 
        text: `현재 '${newMsg.text}'에 대해 학습 중입니다. 곧 더 정확한 답변을 드릴게요! 🤖` 
      }]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 입력 시 엔터 두 번 입력 방지 (isComposing)
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSendMessage();
    }
  };

  // 자동 스크롤
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth' // 부드러운 스크롤 추가
      });
    }
  }, [messages]);

  return (
    <>
      {/* 챗봇 토글 버튼 */}
      <div 
        className="chatbot-toggle" 
        ref={chatButtonRef} 
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      </div>

      {/* 챗봇 모달 */}
      {isChatOpen && (
        <div className="chatbot-modal" ref={chatModalRef}>
          <div className="chat-header">
            <h3>
              <span className="sparkle-icon">✨</span> Gemini 스마트 비서
            </h3>
            <button className="chat-close-btn" onClick={() => setIsChatOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.type}-msg`}>
                {msg.type === 'bot' ? (
                  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input 
              ref={inputRef}
              type="text" 
              className="chat-input-field" 
              placeholder="질문을 입력하세요..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
            />
            <button className="chat-send-btn" onClick={handleSendMessage}>
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;