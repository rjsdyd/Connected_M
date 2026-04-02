import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup as BS


class MovieScraper:
    def __init__(self, headless=False):
        self.options = Options()
        if headless:
            self.options.add_argument("--headless")

        # 리소스 최적화
        self.options.add_argument("--disable-gpu")
        self.options.add_argument("--no-sandbox")
        self.options.add_argument("--disable-dev-shm-usage")
        self.options.add_argument("--blink-settings=imagesEnabled=false")  # 이미지 차단
        self.options.add_argument("--window-size=1200,1000")
        self.options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=self.options
        )
        self.wait = WebDriverWait(self.driver, 10)

    def _clean_text(self, text):
        """
        [핵심] 토큰 절약을 위한 텍스트 정제 로직
        """
        if not text: return ""
        # 1. HTML 태그만 제거 (BeautifulSoup 활용)
        soup = BS(text, 'html.parser')
        text = soup.get_text()  # 텍스트만 남김

        # 2. 연속된 공백 통합
        text = re.sub(r'\s+', ' ', text)

        # 3. 양끝 공백 제거
        return text.strip()

    def get_expert_reviews(self, movie_id, limit=10):
        url = f"http://www.cine21.com/movie/info/?movie_id={movie_id}"
        reviews = []

        try:
            self.driver.get(url)

            # 전문가 리뷰 섹션 대기
            target_list_selector = "ul.expert_star_list"
            self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, target_list_selector)))

            # 부드러운 스크롤로 데이터 렌더링 유도
            target_element = self.driver.find_element(By.CSS_SELECTOR, target_list_selector)
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_element)
            time.sleep(1)

            items = self.driver.find_elements(By.CSS_SELECTOR, f"{target_list_selector} > li")

            for item in items[:limit]:
                try:
                    # 평론가 이름 및 점수 추출
                    name = item.find_element(By.CSS_SELECTOR, "div.reviewer .name").text.strip()
                    score = item.find_element(By.CSS_SELECTOR, "div.reviewer .num").text.strip()

                    # 본문 추출 (우선순위: comment_open -> review)
                    # .text는 이미 HTML을 제거하지만 내부의 지저분한 공백을 _clean_text로 처리함
                    content_raw = ""
                    try:
                        content_raw = item.find_element(By.CSS_SELECTOR, "div.review div.comment_open").text
                    except:
                        content_raw = item.find_element(By.CSS_SELECTOR, "div.review").text

                    # 텍스트 정제 적용
                    clean_content = self._clean_text(content_raw)

                    if clean_content:
                        reviews.append({
                            "critic": name,
                            "score": score,
                            "content": clean_content
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f"   [!] 크롤링 오류: {e}")

        return reviews

    def close(self):
        if self.driver:
            self.driver.quit()