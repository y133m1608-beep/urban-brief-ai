# Urban Brief AI v8 - Balanced Categories

## 변경 내용
- 주요 뉴스가 한 키워드에 몰리지 않도록 수정
- 정책 / 제도, 경제 / 부동산, 사회 / 인구, 도시 / 지역, 환경 / 기후, 기술 / 산업, 문화 / 생활에서 각각 1개씩 뉴스를 가져옴
- 뉴스 카드의 분야 라벨이 키워드가 아니라 분야명으로 표시됨
- 기사 원문 링크 유지
- 오늘의 건축 키워드 유지

## Vercel Environment Variables
필수:
- RESEND_API_KEY
- RECIPIENT_EMAIL
- NAVER_CLIENT_ID
- NAVER_CLIENT_SECRET

자동 메일용 키워드:
- KEYWORDS = 주거정책,도시계획,부동산시장,지역상권,고령화,1인가구,도시재생,교통인프라,기후위기,재난대응,AI,도심물류,관광,소비트렌드

## 주의
자동 메일은 기본 7개 분야 기준으로 균형 수집됩니다.
