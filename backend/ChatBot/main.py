import os
from typing import List

# 1. 라이브러리 임포트
from google import genai  # ✅ 수정: 'import google as genai' 대신 이렇게!
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from pydantic import BaseModel

# 데이터베이스 임포트
import models, database, chatbot_logic

# 2. 환경 설정
load_dotenv()

app = FastAPI()

# CORS 설정 (현업 스타일로 깔끔하게 정리)
origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:8080", "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 데이터 규격(Schema) ---
class ChatRequest(BaseModel):
    user_id: int
    session_id: int
    prompt: str

class SessionRequest(BaseModel):
    user_id: int

# --- API 엔드포인트 ---

@app.get("/")
async def root():
    return {"message": "Connected M AI 서버가 정상 작동 중입니다."}

@app.post("/api/chat/session")
async def create_session(request: SessionRequest, db: Session = Depends(database.get_db)):
    try:
        new_session = models.ChatSession(
            user_id=request.user_id,
            session_title="새로운 대화"
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return {"session_id": new_session.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"세션 생성 실패: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest, db: Session = Depends(database.get_db)):
    try:
        # 1. 영화 검색 (검색어 추출 로직 강화)
        keyword = request.prompt.split()[0][:10] if request.prompt.strip() else ""
        movies = db.query(models.Content).filter(
            (models.Content.title.contains(keyword)) |
            (models.Content.overview.contains(keyword))
        ).limit(3).all()

        # 만약 검색 결과가 없으면 기본 추천 영화 3개를 던져줌
        if not movies:
            movies = db.query(models.Content).limit(3).all()

        # 2. 이전 대화 내역 포맷팅
        history_logs = db.query(models.ChatMessage) \
            .filter(models.ChatMessage.session_id == request.session_id) \
            .order_by(models.ChatMessage.created_at.desc()) \
            .limit(5).all()

        # Gemini SDK 형식에 맞춘 히스토리 구성
        chat_history = [
            {"role": "user" if log.role == "user" else "model", "parts": [{"text": log.message}]}
            for log in reversed(history_logs)
        ]

        # 3. 챗봇 로직 호출
        ai_answer = await chatbot_logic.get_gemini_response(movies, request.prompt, chat_history)

        # 4. 결과 저장 (assistant로 저장하되 히스토리 부를 때 model로 변환)
        db.add_all([
            models.ChatMessage(role="user", message=request.prompt, session_id=request.session_id),
            models.ChatMessage(role="assistant", message=ai_answer, session_id=request.session_id)
        ])
        db.commit()

        return {"answer": ai_answer}

    except Exception as e:
        db.rollback()
        print(f"❌ Chat Error: {e}")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

if __name__ == "__main__":
    import uvicorn
    # 외부 접속 허용을 위해 0.0.0.0으로 설정하신 점 아주 좋습니다!
    uvicorn.run(app, host="0.0.0.0", port=8888)