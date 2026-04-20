import os
import httpx
import asyncio
from google import genai  # 최신 SDK 방식으로 변경
from dotenv import load_dotenv

load_dotenv()

# --- 설정 및 상수 ---
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
GEMINI_MODEL = "gemini-2.5-flash"

# 1. 클라이언트 초기화
client_genai = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 2. 안전 설정 (문자열 방식으로 에러 방지)
SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]


async def fetch_cast(tmdb_id: str, http_client: httpx.AsyncClient):
    """비동기로 TMDB 출연진 정보를 가져옵니다."""
    if not tmdb_id: return "정보 없음"
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/credits"
    params = {"api_key": TMDB_API_KEY, "language": "ko-KR"}

    try:
        response = await http_client.get(url, params=params, timeout=2.0)
        if response.status_code == 200:
            cast = response.json().get('cast', [])
            return ", ".join([m['name'] for m in cast[:5]]) or "정보 없음"
    except Exception:
        pass
    return "정보 없음"


def build_movie_context(movies_with_cast):
    """영화 데이터를 프롬프트용 텍스트로 변환합니다."""
    context = "\n[실시간 영화 데이터베이스]\n"
    for m in movies_with_cast:
        context += (
            f"● {m['title']} ({m['age_rating']})\n"
            f"   - 출연: {m['cast']}\n"
            f"   - 줄거리: {m['overview']}\n\n"
        )
    return context


async def get_gemini_response(db_movies, user_prompt, chat_history):
    """최종 응답 생성 로직"""

    # 1. 비동기로 모든 영화의 출연진을 동시에 조회 (병렬 처리)
    async with httpx.AsyncClient() as http_client:
        tasks = [fetch_cast(m.tmdb_id or m.id, http_client) for m in db_movies]
        casts = await asyncio.gather(*tasks)

    # 2. 데이터 가공
    enriched_data = []
    for m, cast in zip(db_movies, casts):
        enriched_data.append({
            "title": m.title,
            "age_rating": m.age_rating or "정보 없음",
            "overview": m.overview or "내용 없음",
            "cast": cast
        })

    # 3. 시스템 명령어 및 컨텍스트 결합
    system_instruction = (
                             "너는 영화 전문 'Connected M' 비서야. 제공된 데이터를 기반으로 친절하게 답해줘. "
                             "영화 외 질문은 거절하고, 문장은 마침표로 깔끔하게 끝내줘."
                         ) + build_movie_context(enriched_data)

    # 4. 모델 호출 및 응답 생성 (최신 SDK 문법)
    try:
        response = client_genai.models.generate_content(
            model=GEMINI_MODEL,
            contents=user_prompt,  # 대화 기록은 필요 시 contents 리스트에 추가 가능
            config={
                "system_instruction": system_instruction,
                "temperature": 0.7,
                "max_output_tokens": 1000,
                "safety_settings": SAFETY_SETTINGS,
            }
        )
        return response.text.strip()
    except Exception as e:
        return f"죄송합니다. 응답 생성 중 오류가 발생했습니다: {str(e)}"