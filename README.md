# Urban Brief AI v7 - Architecture Keywords + Refresh

## 변경 내용
- `오늘의 설계 키워드`를 `오늘의 건축 키워드`로 수정
- 건축 키워드 섹션을 공간·프로그램 중심 키워드로 정리
- 상단 버튼 `최신 뉴스 업데이트` 클릭 시 네이버 뉴스 API를 다시 호출하도록 캐시 방지 처리
- 업데이트 시간과 새로고침 횟수 표시
- 단, 같은 시각에 새 기사가 없으면 뉴스 목록은 이전과 같을 수 있음

## 기본 뉴스 분야
1. 정책 / 제도
2. 경제 / 부동산
3. 사회 / 인구
4. 도시 / 지역
5. 환경 / 기후
6. 기술 / 산업
7. 문화 / 생활

## Vercel Environment Variables
필수:
- RESEND_API_KEY
- RECIPIENT_EMAIL
- NAVER_CLIENT_ID
- NAVER_CLIENT_SECRET

자동 메일용 키워드:
- KEYWORDS = 주거정책,도시계획,부동산시장,지역상권,고령화,1인가구,도시재생,교통인프라,기후위기,재난대응,AI,도심물류,관광,소비트렌드
