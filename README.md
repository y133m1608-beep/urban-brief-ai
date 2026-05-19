# Urban Brief AI v9 - Category Articles

## 변경 내용
- 메인 뉴스 카드는 분야별 대표 기사로 표시
- 대표 기사 카드를 누르면 해당 분야의 기사 여러 개가 사이드 패널로 열림
- 사이드 패널 안의 기사를 누르면 기사 원문 링크로 이동
- 7개 분야 균형 수집 유지
- 메일 발송은 대표 기사 중심으로 유지

## Vercel Environment Variables
필수:
- RESEND_API_KEY
- RECIPIENT_EMAIL
- NAVER_CLIENT_ID
- NAVER_CLIENT_SECRET


## v10 추가 기능
- 오늘의 주요 뉴스 대표 기사들을 AI가 종합해 `오늘의 건축적 질문`을 자동 생성합니다.
- OPENAI_API_KEY가 없으면 기본 규칙 기반 질문으로 자동 대체됩니다.

## 추가 Vercel Environment Variables
선택:
- OPENAI_API_KEY = OpenAI API Key
- OPENAI_MODEL = gpt-4.1-mini
