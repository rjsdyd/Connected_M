import os
import json
import mysql.connector
from google import genai
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()

# 2. 제미나이 설정 (새로운 SDK 스타일)
# .env의 GEMINI_API_KEY를 읽어오도록 설정
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# 사용할 모델 설정
MODEL_NAME = "gemini-2.5-flash"  # 또는 "gemini-1.5-flash"


def get_db_connection():
    """MariaDB 연결 설정"""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3310)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


def perform_analysis(content_id):
    """전문가+유저 리뷰를 가져와 제미나이 분석 후 DB에 캐싱"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        print(f"🚀 [영화 ID: {content_id}] 분석 시작...")

        # (1) 리뷰 데이터 가져오기
        query = """
            SELECT comment FROM expert_review WHERE content_id = %s
            UNION ALL
            SELECT comment FROM user_review WHERE content_id = %s
        """
        cursor.execute(query, (content_id, content_id))
        rows = cursor.fetchall()

        if not rows:
            print(f"⚠️ 영화 ID {content_id}에 대한 리뷰가 없습니다.")
            return

        all_comments = "\n".join([row['comment'] for row in rows])

        # (2) 제미나이 호출 (JSON 모드 사용)
        # response_mime_type을 설정하면 AI가 마크다운(```json) 없이 순수 JSON만 줍니다.
        prompt = f"""
        당신은 영화 분석 전문가입니다. 아래 제공된 영화 리뷰들을 분석하세요.

        결과물 필수 항목:
        1. summary: 전체 리뷰를 요약한 100자 내외의 한국어 문장.
        2. positive_ratio: 0~100 사이의 긍정 지수 (숫자만).
        3. top_keywords: 가장 중요한 키워드 3개를 쉼표로 구분한 문자열.

        리뷰 내용:
        {all_comments}
        """

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                'response_mime_type': 'application/json'  # JSON 강제 설정
            }
        )

        # (3) 응답 데이터 파싱
        # 신규 SDK는 response.text에 바로 JSON 문자열이 담깁니다.
        data = json.loads(response.text)

        # (4) DB 저장 (Upsert 로직)
        save_query = """
            INSERT INTO analysis_cache (positive_ratio, summary, top_keywords, content_id)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                positive_ratio = VALUES(positive_ratio),
                summary = VALUES(summary),
                top_keywords = VALUES(top_keywords)
        """

        cursor.execute(save_query, (
            data['positive_ratio'],
            data['summary'],
            data['top_keywords'],
            content_id
        ))

        conn.commit()
        print(f"✅ 분석 완료! (긍정 지수: {data['positive_ratio']}%)")

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


if __name__ == "__main__":
    # 테스트 실행
    perform_analysis(1)