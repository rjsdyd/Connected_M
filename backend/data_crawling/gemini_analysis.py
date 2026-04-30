import os
import json
import time
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
MODEL_NAME = "gemini-2.5-flash"


def get_db_connection():
    """MariaDB 연결 설정"""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3310)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        charset='utf8mb4',
        collation='utf8mb4_general_ci'
    )


def perform_analysis(content_id):
    """전문가+유저 리뷰 혹은 줄거리를 가져와 제미나이 분석 후 DB에 캐싱"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        print(f"🚀 [영화 ID: {content_id}] 분석 시작...", flush=True)

        # 기존 리뷰 쿼리는 주석 처리로 남겨둡니다.
        """
        query = """
        #    SELECT comment FROM expert_review WHERE content_id = %s
        #    UNION ALL
        #    SELECT comment FROM user_review WHERE content_id = %s
        """
        """

        # 줄거리(overview)를 가져오는 새로운 쿼리 (들여쓰기 칼정렬 ㅋ)
        query = "SELECT overview FROM content WHERE id = %s"
        cursor.execute(query, (content_id,))
        row = cursor.fetchone()

        # 데이터가 비어있는지 확인
        if not row or not row['overview']:
            print(f"⚠️ 영화 ID {content_id}에 대한 줄거리가 없습니다.")
            return

        # 제미나이에게 보낼 텍스트를 줄거리로 설정
        all_comments = row['overview']

        # (2) 제미나이 호출 (JSON 모드 사용)
        prompt = f"""
        당신은 영화 분석 전문가입니다. 아래 제공된 영화의 줄거리(Overview)를 분석하세요.

        결과물 필수 항목:
        1. summary: 줄거리의 핵심을 짚어 100자 내외의 한국어 문장으로 요약.
        2. positive_ratio: 줄거리의 분위기를 고려한 예상 긍정 지수 (0~100 사이 숫자만).
        3. top_keywords: 영화를 상징하는 핵심 단어, 장르(사극, SF, 우주 등), 분위기를 포함하여 10개를 쉼표로 구분한 문자열.

        줄거리 내용:
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
        data = json.loads(response.text)

        # (4) DB 저장 (Upsert 로직)
        save_query = """
            INSERT INTO analysis_cache (id, positive_ratio, summary, top_keywords, search_keywords, content_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                positive_ratio = VALUES(positive_ratio),
                summary = VALUES(summary),
                top_keywords = VALUES(top_keywords),
                search_keywords = VALUES(search_keywords),
                content_id = VALUES(content_id)
        """

        cursor.execute(save_query, (
            content_id,  # id 컬럼에 들어갈 값
            data['positive_ratio'],
            data['summary'],
            data['top_keywords'],
            data['top_keywords'],  # search_keywords에도 똑같이 채워줌
            content_id  # content_id 컬럼에 들어갈 값
        ))

        conn.commit()
        print(f"✅ 분석 완료! (긍정 지수: {data['positive_ratio']}%)", flush=True)

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


if __name__ == "__main__":
    # 1. DB를 열어서 '분석 대기 중'인 영화 ID를 싹 다 가져옵니다. ㅋ
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # db_filler.py가 넣어둔 '분석 대기 중'인 영화들만 골라냅니다.
    cursor.execute("SELECT content_id FROM analysis_cache WHERE summary = '분석 대기 중'")
    pending_movies = cursor.fetchall()

    print(f"🔎 분석 타겟 {len(pending_movies)}건 발견! 작전을 시작합니다. ㅋㅋㅋㅋ")

    # 2. 찾은 영화들을 하나씩 명준님의 perform_analysis 함수에 집어넣습니다.
    for movie in pending_movies:
        perform_analysis(movie['content_id'])
        time.sleep(1)

    print("🏁 모든 영화에 대한 제미나이 분석이 끝났습니다!")
    cursor.close()
    conn.close()