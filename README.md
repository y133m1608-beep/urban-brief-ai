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


## v11 추가 기능
- `건축 분야에 미칠 종합 영향`이 고정 문장이 아니라, 오늘 수집된 뉴스 대표 기사들을 바탕으로 AI가 자동 생성합니다.
- OPENAI_API_KEY가 있으면 AI 기반으로 4개 문장을 생성합니다.
- OPENAI_API_KEY가 없으면 뉴스 키워드에 따라 규칙 기반 문장으로 대체됩니다.


## v12 추가 기능
- 분야별 대표 뉴스가 서로 겹치지 않도록 전역 중복 제거 로직을 추가했습니다.
- 기사 URL과 제목을 정규화하여 같은 기사 또는 거의 같은 기사 제목이 다른 분야에 반복 표시되는 것을 줄였습니다.
- 한 분야에서 이미 대표 기사로 선택된 기사는 다른 분야 대표 기사와 기사 목록에서 제외됩니다.
