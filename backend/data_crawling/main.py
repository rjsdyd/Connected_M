'''
[ 프로젝트 핵심 모듈 및 환경 설정 불러오기 ]

1. movie_data: 
   - 크롤링할 영화 목록 및 타겟 URL 정보가 담긴 데이터 저장소입니다.
2. scraper (MovieScraper): 
   - 셀레니움(Selenium)을 이용해 실제로 웹사이트에 접속하고 데이터를 긁어오는 '수집기'입니다.
3. expert_saver (ExpertSaver): 
   - 수집된 데이터를 MariaDB에 안전하게 저장하는 '저장소 매니저'입니다.
4. dotenv (load_dotenv): 
   - .env 파일에 숨겨둔 DB 비밀번호 등 보안 정보를 읽어오는 '보안 관리자'입니다.
'''

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
    DEFAULT_ANALYSIS_ID = 1

    for genre, movies in movie_data.MOVIE_CATEGORIES.items():
        print(f"\n --- {genre} ---")

        for movie_name, cine21_id in movies.items():
            print(f"'{movie_name}' 수집중... ID: {cine21_id} ")

            try:
                result = scraper.get_expert_reviews(cine21_id, limit=10)

                if result:
                    db.save_review(
                        content_id=content_id_cnt,
                        analysis_id=DEFAULT_ANALYSIS_ID,
                        movie_title=movie_name,
                        reviews=result
                    )
                    print(f"저장 완료 (content_id : {content_id_cnt}, 제목 : {movie_name})")
                else:
                    print("수집 된 리뷰가 없습니다.")

            except Exception as e:
                print(f"오류 발생: {e}")
            
            # 3. 결과가 있든 없든, 한 영화 작업이 끝나면 번호를 하나 올립니다.
            content_id_cnt += 1

    scraper.close()

if __name__ == "__main__":
    save_data_and_crawling_plzplzplz()



