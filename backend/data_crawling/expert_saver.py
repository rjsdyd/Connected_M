'''
[ DB 연결 및 보안 도구 상자 ]

1. pymysql: 
   - 파이썬에서 만든 데이터를 데이터베이스(MariaDB)로 실어 나르는 '운반 트럭'입니다.
2. os: 
   - 우리 컴퓨터 시스템에 접근하는 '관리자'입니다. 파일 경로를 찾거나 시스템 설정을 읽을 때 씁니다.
3. load_dotenv: 
   - 비밀번호가 적힌 .env 파일을 읽어오는 '보안 요원'입니다. 
'''

import pymysql
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

'''DB 정보 로드 (기본 포트 3310 설정)'''
db_host = os.getenv('DB_HOST')
db_port = int(os.getenv('DB_PORT')) if os.getenv('DB_PORT') else 3310
db_user = os.getenv('DB_USER')
db_pw = os.getenv('DB_PASSWORD')
db_name = os.getenv('DB_NAME')

class ExpertSaver:
    def __init__(self, host, user, password, db, port=3310):
        self.config = {
            'host': host,
            'user': user,
            'password': password,
            'db': db,
            'port': port,
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }
        # 객체 생성 시 테이블과 필수 부모 데이터를 즉시 점검합니다.
        self._init_db()

    def _get_connection(self):
        """DB 연결 객체를 생성합니다."""
        return pymysql.connect(**self.config)

    def _init_db(self):
        """[자가 치유] 테이블 생성 및 외래 키 에러 방지용 필수 데이터 삽입"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                # 1. analysis_cache 테이블에 1번 데이터가 없으면 강제 생성
                # (DB를 지웠다 다시 만들었을 때 에러 방지)
                cur.execute('''
                    INSERT IGNORE INTO `analysis_cache` (id, summary, positive_ratio) 
                    VALUES (1, '데이터 수집을 위한 임시 분석 객체', 0.0);
                ''')

                # 2. expert_review 테이블 생성
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS `expert_review` (
                        `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `content_id` BIGINT NOT NULL,
                        `analysis_id` BIGINT NOT NULL,
                        `movie_title` VARCHAR(255) NOT NULL,
                        `critic_name` VARCHAR(100) NOT NULL,
                        `rating` DECIMAL(3,1) NOT NULL,
                        `comment` TEXT NOT NULL,
                        `source` VARCHAR(50) DEFAULT 'Cine21',
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ''')
            conn.commit()
            print(f"✅ DB 초기화 완료 (접속 포트: {self.config['port']})")
        except Exception as e:
            print(f"⚠️ 초기화 중 알림: {e}")
        finally:
            conn.close()

    def save_review(self, content_id, analysis_id, movie_title, reviews):
        """리뷰 저장 (부모 데이터 자동 생성 포함)"""
        if not reviews:
            return

        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                # --- [방어 1] analysis_cache 1번 데이터 확인 및 재생성 ---
                cur.execute("SELECT id FROM analysis_cache WHERE id = %s", (analysis_id,))
                if not cur.fetchone():
                    cur.execute(
                        "INSERT INTO analysis_cache (id, summary, positive_ratio) VALUES (%s, %s, %s)",
                        (analysis_id, '임시 분석 데이터', 0.0)
                    )

                # --- [방어 2] content 테이블 영화 정보 확인 및 재생성 ---
                # tmdb_id 중복(Unique) 에러 방지를 위해 content_id를 똑같이 사용
                cur.execute("SELECT id FROM content WHERE id = %s", (content_id,))
                if not cur.fetchone():
                    cur.execute(
                        "INSERT INTO content (id, title, tmdb_id) VALUES (%s, %s, %s)",
                        (content_id, movie_title, content_id)
                    )
                    print(f"ℹ️ content 테이블에 {movie_title} 정보를 자동 생성했습니다.")

                # --- [방어 3] 리뷰 일괄 저장 ---
                sql = """
                      INSERT INTO expert_review (content_id, analysis_id, movie_title, critic_name, rating, comment, source) \
                      VALUES (%s, %s, %s, %s, %s, %s, %s) \
                      """

                data_insert = []
                for r in reviews:
                    row = (
                        content_id,   
                        analysis_id,  
                        movie_title,  
                        r['critic'],  
                        float(r['score']),  
                        r['content'],  
                        'Cine21'  
                    )
                    data_insert.append(row)

                cur.executemany(sql, data_insert)

            conn.commit()
            print(f"✨ '{movie_title}' 리뷰 {len(reviews)}건 저장 성공!")

        except Exception as e:
            print(f"❌ 저장 에러 발생: {e}")
            conn.rollback()
        finally:
            conn.close()