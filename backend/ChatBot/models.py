from sqlalchemy import BigInteger, String, Text, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import datetime
from typing import List, Optional


# 2.0 스타일의 Base 클래스 선언
class Base(DeclarativeBase):
    pass


class ChatSession(Base):
    __tablename__ = "chat_session"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    session_title: Mapped[Optional[str]] = mapped_column(String(100))
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)  # 스프링부트 유저 ID

    # 서버 시간이 아닌 DB 시간 기준 (server_default)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # relationship 타입 힌트 (ChatMessage 객체 리스트를 가짐)
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="session", cascade="all, delete-orphan"
    )


class ChatMessage(Base):
    __tablename__ = "chat_message"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' or 'assistant'
    session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("chat_session.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # 역참조 관계
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")


class Content(Base):
    __tablename__ = "content"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    overview: Mapped[Optional[str]] = mapped_column(Text)
    age_rating: Mapped[Optional[str]] = mapped_column(String(255))
    runtime: Mapped[Optional[int]] = mapped_column(Integer)
    poster_path: Mapped[Optional[str]] = mapped_column(String(255))
    tmdb_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True)