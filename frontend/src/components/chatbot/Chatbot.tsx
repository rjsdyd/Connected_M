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
    { id: 1, type: 'bot', text: '<strong>반갑습니다! 👋</strong><br> 궁금한 영화나 드라마가 있다면 무엇이든 물어보세요.' }
  ]);
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatModalRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기 로직
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

  // 메시지 전송 로직
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = { id: Date.now(), type: 'user', text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: `'${newMsg.text}'에 대한 답변입니다.` }]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // 자동 스크롤
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  return (
    <>
      <div className="chatbot-toggle" ref={chatButtonRef} onClick={(e) => { e.preventDefault(); setIsChatOpen(!isChatOpen); }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      </div>

      {isChatOpen && (
        <div className="chatbot-modal" ref={chatModalRef}>
          <div className="chat-header">
              <h3>Gemini 스마트 비서</h3>
              <span style={{ cursor: 'pointer', fontSize: '28px' }} onClick={() => setIsChatOpen(false)}>&times;</span>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-msg ${msg.type}-msg`}>
                  {msg.type === 'bot' ? <span dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
                </div>
              ))}
          </div>
          <div className="chat-input-area">
              <input type="text" className="chat-input-field" placeholder="질문을 입력하세요" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyPress} />
              <button className="chat-send-btn" onClick={handleSendMessage}>전송</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;