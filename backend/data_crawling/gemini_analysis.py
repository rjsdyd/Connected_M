import os
import json
import mysql.connector
import google.generativeai as genai
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()

# 2. 제미나이 설정
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')


def get_db_connection():
    """MariaDB 연결 설정"""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3310)),  # 기본값 3310
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

        # (1) 전문가 리뷰(expert_review)와 유저 리뷰(user_review) 합쳐서 가져오기
        # 이미지의 user_review 구조와 맞춰 'comment' 컬럼을 긁어옵니다.
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

        # 리뷰 텍스트 합치기
        all_comments = "\n".join([row['comment'] for row in rows])

        # (2) 제미나이 프롬프트 (JSON 응답 강제)
        prompt = f"""
        당신은 영화 분석 전문가입니다. 아래 영화 리뷰들을 분석하여 반드시 지정된 JSON 형식으로만 답변하세요.
        마크다운(```json) 없이 순수 JSON 텍스트만 출력해야 합니다.

        1. summary: 전체 리뷰를 요약한 100자 내외의 한국어 문장.
        2. positive_ratio: 0~100 사이의 긍정 지수 (숫자만).
        3. top_keywords: 가장 중요한 키워드 3개를 쉼표로 구분한 문자열.

        리뷰 내용:
        {all_comments}
        """

        # (3) AI 호출 및 응답 처리
        response = model.generate_content(prompt)
        # 응답 텍스트 정제 (불필요한 마크다운 제거)
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(clean_text)

        # (4) analysis_cache 테이블에 저장 (이미지 구조 반영)
        # content_id가 UNIQUE로 설정되어 있어야 중복 시 UPDATE가 작동합니다.
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


# 단독 실행 테스트 (1번 영화)
if __name__ == "__main__":
    perform_analysis(1)