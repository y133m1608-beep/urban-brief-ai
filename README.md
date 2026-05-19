# Urban Brief AI v4 - Live Naver News

## 변경 내용
- 네이버 뉴스 검색 API로 최신 뉴스 자동 수집
- 뉴스 카드 클릭 시 검색결과가 아니라 기사 원문 URL(originallink)로 이동
- 메일 발송 및 매일 오전 8시 자동 발송도 최신 뉴스 기반으로 변경

## 필수 Vercel Environment Variables
- RESEND_API_KEY
- RECIPIENT_EMAIL
- NAVER_CLIENT_ID
- NAVER_CLIENT_SECRET

## 선택 Environment Variables
- FROM_EMAIL
- PROJECT_NAME
- KEYWORDS

## 네이버 API 신청
Naver Developers에서 Search API 사용 애플리케이션을 만들고 Client ID / Client Secret을 발급받아야 합니다.

## Cron
vercel.json의 0 23 * * *는 UTC 기준 23:00이며, 한국 시간 오전 8시입니다.
