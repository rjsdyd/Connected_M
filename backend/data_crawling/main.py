import movie_data
from movie_data import MOVIE_CATEGORIES
from scraper import MovieScraper
from expert_saver import ExpertSaver, db_host, db_port, db_user, db_pw, db_name
from dotenv import load_dotenv
from gemini_analysis import perform_analysis

# 환경 변수 로드
load_dotenv()

DEFAULT_ANALYSIS_ID = 1  # 외래키 제약조건 방지용 기본 ID

def save_data_and_crawling():
    """1단계: 셀레니움으로 전문가 리뷰 수집 및 DB 저장"""
    scraper = MovieScraper(headless=True)
    db = ExpertSaver(
        host=db_host,
        port=db_port,
        user=db_user,
        password=db_pw,
        db=db_name
    )

    print("\n🚀 [1단계] 데이터 수집 및 적재 시작")

    for genre, movies in MOVIE_CATEGORIES.items():
        print(f"\n--- 장르: {genre} ---")
        for movie_name, cine21_id in movies.items():
            print(f"'{movie_name}' 수집 중... (Cine21 ID: {cine21_id})")

            try:
                # 크롤링 수행
                result = scraper.get_expert_reviews(cine21_id, limit=10)

                if result:
                    db.save_review(
                        cine21_id=cine21_id,
                        analysis_id=DEFAULT_ANALYSIS_ID,
                        movie_title=movie_name,
                        reviews=result
                    )
                    print(f"✅ 저장 완료: {movie_name}")
                else:
                    print(f"⚠️ {movie_name}: 수집된 리뷰가 없습니다.")

            except Exception as e:
                print(f"❌ {movie_name} 처리 중 오류 발생: {e}")

    scraper.close()
    print("\n🏁 데이터 수집 단계 종료")


def run_all_analysis():
    """2단계: 수집된 데이터를 바탕으로 제미나이 AI 분석 실행"""
    print("\n🤖 [2단계] 제미나이 AI 분석 및 캐싱 시작")

    # 영화 ID 1번부터 25번까지 순회하며 분석
    # (팁: DB에서 실제 존재하는 content_id 목록을 가져와서 돌리는 게 더 정확하지만,
    #  현재는 1~25번까지 있다고 가정하고 진행.)
    for movie_id in range(1, 26):
        try:
            perform_analysis(movie_id)
        except Exception as e:
            print(f"❌ 영화 ID {movie_id} 분석 중 에러: {e}")

    print("\n✨ 모든 분석 작업이 완료되었습니다!")


if __name__ == "__main__":
    # 1. 먼저 크롤링을 해서 DB에 리뷰를 쌓고
    save_data_and_crawling()

    # 2. 쌓인 리뷰를 제미나이가 읽어서 분석하게 함
    run_all_analysis()