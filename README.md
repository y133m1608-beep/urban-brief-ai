# Urban Brief AI v5 - Keyword Filtered

## 변경 내용
- 사용자가 웹사이트에서 입력한 관심 키워드가 즉시 뉴스 검색에 적용됩니다.
- 키워드 추가/삭제 시 뉴스가 다시 업데이트됩니다.
- 네이버 API 검색어에 `건축`, `도시`, `공간`, `정책` 조건을 함께 적용해 관련 없는 연예/잡뉴스를 줄였습니다.
- 뉴스 카드는 기사 원문 URL로 이동합니다.

## 주의
웹사이트에서 입력한 키워드는 현재 브라우저 화면과 수동 메일 발송에는 바로 적용됩니다.
매일 오전 8시 자동 메일은 브라우저가 꺼져 있어도 실행되어야 하므로 Vercel Environment Variable의 KEYWORDS 값을 사용합니다.

## Vercel Environment Variables
필수:
- RESEND_API_KEY
- RECIPIENT_EMAIL
- NAVER_CLIENT_ID
- NAVER_CLIENT_SECRET

자동 메일 키워드를 바꾸려면:
- KEYWORDS = 도시재생,전통시장,공중가로,물류,주거,기후대응,공공공간
