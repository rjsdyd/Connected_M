import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

db_host = os.getenv('DB_HOST')
db_port = int(os.getenv('DB_PORT'))
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
        self._init_db()

    def _get_connection(self):
        return pymysql.connect(**self.config)



    def save_review(self, content_id, analysis_id, movie_title, reviews):
        if not reviews:
            return

        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                sql = """
                      INSERT INTO ExpertReview (content_id, analysis_id, movie_title, critic_name, rating, comment, source) \
                      VALUES (%s, %s, %s, %s, %s, %s, %s) \
                      """

                data_insert = []
                for r in reviews:
                    row = (
                        content_id,   # 1. content_id
                        analysis_id,  # 2. analysis_id
                        movie_title,  # 3. movie_title
                        r['critic'],  # 4. critic_name
                        float(r['score']),  # 5. rating
                        r['content'],  # 6. comment
                        'Cine21'  # 7. source
                    )
                    data_insert.append(row)

                cur.executemany(sql, data_insert)

            conn.commit()
            print(f"'{movie_title}' (Analysis ID: {analysis_id}) 리뷰 {len(reviews)}건 저장 완료")

        except Exception as e:
            print(f"❌ 저장 중 에러 발생: {e}")
            conn.rollback()
        finally:
            conn.close()


    def _init_db(self):
        """테이블 생성 테스트"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS `expertreview` (
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
        finally:
            conn.close()
        pass