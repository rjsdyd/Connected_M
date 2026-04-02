import movie_data
from movie_data import MOVIE_CATEGORIES
from scraper import MovieScraper
from expert_saver import ExpertSaver, db_host, db_port, db_user, db_pw, db_name
from dotenv import load_dotenv

load_dotenv()


def save_data_and_crawling_plzplzplz():
    scraper = MovieScraper(headless=True)

    db = ExpertSaver(
        host=db_host,
        port=db_port,
        user=db_user,
        password=db_pw,
        db=db_name
    )

    print("데이터 적재 시작")

    content_id_cnt = 1

    for genre, movies in movie_data.MOVIE_CATEGORIES.items():
        print(f"\n --- {genre} ---")

        for movie_name, cine21_id in movies.items():
            print(f"'{movie_name}' 수집중... ID: {cine21_id} ")

            try:
                # 데이터 수집
                result = scraper.get_expert_reviews(cine21_id, limit=10)

                if result:
                    # 기록 저장
                    db.save_review(
                        content_id=1,
                        analysis_id=1,
                        movie_title=movie_name,
                        reviews=result
                    )
                    print(f"저장 완료 (content_id : {content_id_cnt}, 제목 : {movie_name})")
                else:
                    print("수집 된 리뷰가 없습니다.")
                content_id_cnt += 1

            except Exception as e:
                print(f"오류 발생: {e}")

    scraper.close()

if __name__ == "__main__":
    save_data_and_crawling_plzplzplz()



