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
            """[자가 치유] 테이블 생성 및 컬럼 자동 추가"""
            conn = self._get_connection()
            try:
                with conn.cursor() as cur:
                    # 1. content 테이블에 cine21_id 컬럼이 없으면 자동으로 추가 (에러 방지 핵심!)
                    try:
                        cur.execute("SELECT cine21_id FROM content LIMIT 1")
                    except pymysql.err.InternalError as e:
                        # 1054 에러(컬럼 없음) 발생 시 컬럼 추가
                        if e.args[0] == 1054:
                            print("ℹ️ 'content' 테이블에 'cine21_id' 컬럼이 없어 추가합니다...")
                            cur.execute("ALTER TABLE content ADD COLUMN cine21_id VARCHAR(50) UNIQUE")
                            conn.commit()
                    
                    # 2. analysis_cache 테이블 필수 데이터 확인
                    cur.execute('''
                        INSERT IGNORE INTO `analysis_cache` (id, summary, positive_ratio) 
                        VALUES (1, '데이터 수집을 위한 임시 분석 객체', 0.0);
                    ''')

                    # 3. expert_review 테이블 생성 (더 견고하게 수정)
                    cur.execute('''
                        CREATE TABLE IF NOT EXISTS `expert_review` (
                            `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                            `content_id` BIGINT NOT NULL,
                            `analysis_id` BIGINT NOT NULL,
                            `movie_title` VARCHAR(255) NOT NULL,
                            `critic_name` VARCHAR(100) NOT NULL,
                            `rating` VARCHAR(10) NOT NULL,
                            `comment` TEXT NOT NULL,
                            `source` VARCHAR(50) DEFAULT 'Cine21',
                            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            -- 성능을 위해 content_id에 인덱스 추가
                            INDEX idx_content_id (content_id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    ''')
                conn.commit()
                print(f"✅ DB 초기화 및 컬럼 체크 완료 (포트: {self.config['port']})")
            except Exception as e:
                print(f"⚠️ 초기화 중 알림: {e}")
            finally:
                conn.close()

    def save_review(self, cine21_id, analysis_id, movie_title, reviews):
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

                # --- [방어 2] content 테이블 영화 정보 확인 및 재생성 (cine21_id 기준) ---
                cur.execute("SELECT id FROM content WHERE cine21_id = %s", (cine21_id,))
                row = cur.fetchone()
                
                if row:
                    content_id = row['id']
                else:
                    # 영화 정보가 없으면 새로 생성 (cine21_id 포함)
                    # tmdb_id는 현재 크롤러 구조상 cine21_id와 동일하게 임시로 저장하거나 NULL 가능하게 처리
                    cur.execute(
                        "INSERT INTO content (title, tmdb_id, cine21_id) VALUES (%s, %s, %s)",
                        (movie_title, cine21_id, cine21_id)
                    )
                    content_id = cur.lastrowid
                    print(f"ℹ️ content 테이블에 '{movie_title}' 정보를 자동 생성했습니다. (ID: {content_id})")

                # --- [방어 3] 리뷰 일괄 저장 ---
                sql = """
                      INSERT INTO expert_review (content_id, analysis_id, movie_title, critic_name, rating, comment, source) \
                      VALUES (%s, %s, %s, %s, %s, %s, %s) \
                      """

                data_insert = []
                for r in reviews:
                    row_data = (
                        content_id,   
                        analysis_id,  
                        movie_title,  
                        r['critic'],  
                        str(r['score']),  # 문자열 그대로 저장 (float 형변환 제거)
                        r['content'],  
                        'Cine21'  
                    )
                    data_insert.append(row_data)

                cur.executemany(sql, data_insert)

            conn.commit()
            print(f"✨ '{movie_title}' 리뷰 {len(reviews)}건 저장 성공!")

        except Exception as e:
            print(f"❌ 저장 에러 발생: {e}")
            conn.rollback()
        finally:
            conn.close()