from sqlalchemy import create_all, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 1. DB 연결 주소
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 2. 엔진 생성 (DB와의 실제 물리적 연결 통로)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. 세션 팩토리 (데이터를 주고받는 '작업 단위'를 만드는 곳)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. 모델들이 상속받을 기본 클래스
Base = declarative_base()

# 5. FastAPI에서 DB 세션을 안전하게 사용하기 위한 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()