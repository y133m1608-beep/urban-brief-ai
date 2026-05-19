# Urban Brief AI v3 - Auto Mail

## 포함 기능
- 뉴스 카드 클릭 시 관련 뉴스 검색 페이지로 이동
- `브리핑 메일 보내기` 버튼 클릭 시 실제 이메일 발송
- Vercel Cron Job으로 매일 오전 8시경 자동 발송

## 필수 설정
Vercel Project Settings > Environment Variables 에서 아래 값을 설정하세요.

- RESEND_API_KEY: Resend에서 발급받은 API Key
- RECIPIENT_EMAIL: 매일 자동 브리핑을 받을 이메일
- FROM_EMAIL: 선택 사항. 기본값은 Urban Brief AI <onboarding@resend.dev>
- PROJECT_NAME: 선택 사항
- KEYWORDS: 선택 사항. 쉼표로 구분

## Cron 시간
vercel.json의 `0 23 * * *`는 UTC 기준 23:00입니다.
한국 시간으로 다음날 오전 8시입니다.

## 주의
Resend의 테스트 발신 주소(onboarding@resend.dev)는 계정/수신자 제한이 있을 수 있습니다.
제대로 운영하려면 Resend에서 도메인을 인증하고 FROM_EMAIL을 인증된 도메인 주소로 설정하세요.
