# Connected_M - 영화 탐색 및 분석 플랫폼

Connected_M은 다채로운 영화 정보와 개인 맞춤형 추천을 제공하는 종합 플랫폼입니다. TMDB와 씨네21(Cine21)의 데이터를 통합하여 사용자에게 깊이 있는 통찰력과 AI 기반의 도움, 그리고 원활한 영화 탐색 경험을 제공합니다.

---

## 🚀 주요 기능

### 🎬 영화 탐색 및 상세 정보
- **데이터 통합:** TMDB의 대중적인 영화 데이터와 씨네21의 전문적인 분석 데이터를 결합하여 제공합니다.
- **상세 정보:** 줄거리, 출연진/제작진, 장르 및 전문가 분석 내용을 확인할 수 있습니다.
- **랭킹 및 키워드:** 주간 랭킹과 트렌드 키워드를 통해 영화를 발견할 수 있습니다.
- **검색:** 제목이나 관련 키워드로 영화를 빠르게 검색할 수 있습니다.

### 👤 사용자 경험
- **스마트 인증:** 카카오, 구글 소셜 로그인(OAuth2) 또는 일반 이메일 인증(JWT 토큰 기반)을 지원합니다.
- **개인화 프로필:** 마이페이지를 통해 사용자 정보와 저장한 콘텐츠를 관리할 수 있습니다.
- **계정 관리:** 회원가입, 추가 정보 입력, 이메일을 통한 비밀번호 재설정 기능을 제공합니다.

### 🤖 AI 기반 기능
- **AI 챗봇:** 영화 관련 문의 및 개인 맞춤형 추천을 돕는 통합 챗봇을 제공합니다.
- **콘텐츠 분석:** 사용자에게 더 나은 통찰력을 제공하기 위한 영화 데이터의 심층 분석을 수행합니다.

---

## 🛠 기술 스택

### Backend
- **Framework:** Java 17, Spring Boot 3.2.4
- **Security:** Spring Security, OAuth2 (Kakao/Google), JWT
- **Database:** MariaDB (로컬 인스턴스, 포트 3310)
- **ORM:** Spring Data JPA / Hibernate
- **API Documentation:** Swagger UI (SpringDoc)
- **Mailing:** 비밀번호 재설정 및 인증을 위한 Java Mail Sender

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** Vanilla CSS (컴포넌트별 모듈화)

### Data Collection (데이터 수집)
- **Python Scripts:** `scraper.py`와 `movie_data.py`를 사용한 TMDB 및 씨네21 데이터 수집 자동화 스크립트.

---

## 📂 프로젝트 구조

```text
Connected_M/
├── backend/                # Spring Boot 애플리케이션
│   ├── src/main/java/      # 백엔드 소스 코드 (도메인 주도 설계)
│   ├── src/main/resources/ # 설정 파일 (application.properties, data.sql)
│   └── data_crawling/      # 데이터 수집용 파이썬 스크립트
├── frontend/               # React 애플리케이션
│   ├── src/components/     # 재사용 가능한 UI 컴포넌트 (Chatbot, Layout 등)
│   ├── src/pages/          # 메인 페이지 컴포넌트 (Home, MovieDetail 등)
│   └── src/hooks/          # 커스텀 리액트 훅 (인증 체크 등)
└── learning_logs/          # 프로젝트 개발 로그 및 기획 문서
```

---

## ⚙️ 설치 및 설정

### 사전 요구 사항
- JDK 17
- Node.js (v18 이상)
- MariaDB
- Python 3.x (데이터 수집용)

### 백엔드 설정
1. `backend/` 디렉토리로 이동합니다.
2. `application.properties`를 설정합니다 (데이터베이스 정보, API 키 등).
3. 애플리케이션을 실행합니다:
   ```bash
   ./gradlew bootRun
   ```
4. Swagger API 문서는 `http://localhost:8080/swagger-ui.html`에서 확인할 수 있습니다.

### 프론트엔드 설정
1. `frontend/` 디렉토리로 이동합니다.
2. 의존성 라이브러리를 설치합니다:
   ```bash
   npm install
   ```
3. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```

---

## 👥 팀원 (Contributors)

| 이름 | 역할 |
| --- | --- |
| 이명준 | 총괄 |
| 이건용 | 백엔드, 프론트엔드 |
| 이승우 | 데이터크롤링 |
| 조우진 | UI 구현,프론트엔드 |
| 한규대 | 데이터베이스 |

---

## 📝 라이선스
본 프로젝트는 교육 및 포트폴리오 목적으로 제작되었습니다. 영화 데이터는 TMDB와 씨네21에서 제공받았습니다.
