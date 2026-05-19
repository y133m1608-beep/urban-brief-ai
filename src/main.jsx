
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const newsItems = [
  {
    category: "정책 / 도시",
    title: "도심 노후 상업지 정비 지원 확대 논의",
    summary:
      "노후 상업지와 기존 상권을 대상으로 환경 개선, 보행환경 정비, 지역상권 활성화를 지원하는 정책이 논의되고 있다.",
    tags: ["노후상가", "도시재생", "보행환경"],
    url:
      "https://search.naver.com/search.naver?where=news&query=%EB%8F%84%EC%8B%AC%20%EB%85%B8%ED%9B%84%20%EC%83%81%EC%97%85%EC%A7%80%20%EC%A0%95%EB%B9%84%20%EC%A7%80%EC%9B%90"
  },
  {
    category: "사회",
    title: "고령 인구 증가에 따른 생활권 돌봄 인프라 확충 필요성 증가",
    summary:
      "고령화가 심화되면서 병원 중심의 돌봄을 넘어 주거지 가까운 곳에서 이용 가능한 생활권 복지·돌봄 시설의 필요성이 커지고 있다.",
    tags: ["고령화", "생활권", "돌봄"],
    url:
      "https://search.naver.com/search.naver?where=news&query=%EA%B3%A0%EB%A0%B9%ED%99%94%20%EC%83%9D%ED%99%9C%EA%B6%8C%20%EB%8F%8C%EB%B4%84%20%EC%9D%B8%ED%94%84%EB%9D%BC"
  },
  {
    category: "경제 / 물류",
    title: "온라인 소비 증가로 도심형 물류 거점 수요 확대",
    summary:
      "소비 방식이 온라인 중심으로 이동하면서 도심 안에서 보관, 분류, 배송을 처리할 수 있는 소규모 물류 거점의 중요성이 높아지고 있다.",
    tags: ["도심물류", "라스트마일", "상업공간"],
    url:
      "https://search.naver.com/search.naver?where=news&query=%EB%8F%84%EC%8B%AC%ED%98%95%20%EB%AC%BC%EB%A5%98%20%EA%B1%B0%EC%A0%90%20%EB%9D%BC%EC%8A%A4%ED%8A%B8%EB%A7%88%EC%9D%BC"
  },
  {
    category: "환경",
    title: "폭염 대응을 위한 도시 그늘, 쉼터, 보행환경 개선 요구 확대",
    summary:
      "기후위기로 인한 폭염과 집중호우가 반복되면서 보행자를 보호하는 그늘, 캐노피, 반외부공간, 공공 쉼터의 필요성이 커지고 있다.",
    tags: ["기후대응", "반외부공간", "공공공간"],
    url:
      "https://search.naver.com/search.naver?where=news&query=%ED%8F%AD%EC%97%BC%20%EB%8F%84%EC%8B%9C%20%EA%B7%B8%EB%8A%98%20%EC%89%BC%ED%84%B0%20%EB%B3%B4%ED%96%89%ED%99%98%EA%B2%BD"
  },
  {
    category: "문화 / 지역",
    title: "지역 상권과 관광을 연결하는 로컬 경험형 공간 주목",
    summary:
      "단순 소비보다 지역의 생활문화와 상품을 직접 경험할 수 있는 상업공간에 대한 관심이 높아지고 있다.",
    tags: ["로컬경험", "상업공간", "관광"],
    url:
      "https://search.naver.com/search.naver?where=news&query=%EB%A1%9C%EC%BB%AC%20%EA%B2%BD%ED%97%98%ED%98%95%20%EC%83%81%EC%97%85%EA%B3%B5%EA%B0%84%20%EA%B4%80%EA%B4%91"
  }
];

const initialKeywords = ["도시재생", "전통시장", "공중가로", "물류", "주거", "기후대응", "공공공간"];

function App() {
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("남대문시장 C·D동 리노베이션");
  const [keywords, setKeywords] = useState(initialKeywords);
  const [keywordInput, setKeywordInput] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const commonFlow =
    "오늘의 뉴스들은 공통적으로 기존 도시공간을 단순히 새로 개발하는 것이 아니라, 생활 인프라로 다시 조직하려는 흐름을 보여준다. 노후 상업지, 고령화, 도심 물류, 기후 대응, 로컬 경험은 서로 다른 이슈처럼 보이지만 모두 기존 도시조직 안에서 새로운 기능을 수용하고 연결하는 문제로 이어진다.";

  const impacts = [
    "기존 건축물과 도시조직을 철거하기보다, 새로운 프로그램을 삽입하고 재구성하는 리노베이션 전략이 중요해진다.",
    "주거, 상업, 물류, 돌봄, 공공공간이 하나의 생활권 안에서 복합적으로 결합될 가능성이 커진다.",
    "기후 변화에 대응하기 위해 그늘, 캐노피, 중정, 공중가로, 테라스 같은 반외부공간이 도시 인프라로 다뤄질 수 있다.",
    "건축가는 형태를 만드는 역할을 넘어 사회적 변화와 공간 프로그램 사이의 관계를 조직하는 역할을 요구받게 된다."
  ];

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value) return;
    if (!keywords.includes(value)) setKeywords([...keywords, value]);
    setKeywordInput("");
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      setStatus("수신 이메일을 먼저 입력하세요.");
      return;
    }

    setIsSending(true);
    setStatus("메일을 보내는 중입니다...");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          project,
          keywords
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "메일 발송에 실패했습니다.");
      }

      setStatus("메일이 전송되었습니다. 받은 편지함 또는 스팸함을 확인하세요.");
    } catch (error) {
      setStatus(error.message || "메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="eyebrow">매일 오전 8시 자동 브리핑 에이전트</div>
          <h1>Urban Brief AI</h1>
          <p>
            사회·정치·경제·환경 뉴스를 먼저 정리하고, 여러 뉴스에서 나타나는
            공통 흐름이 건축 분야에 미칠 영향을 종합적으로 분석하는 건축 시사
            에이전트입니다.
          </p>
        </div>

        <div className="hero-card">
          <span>오늘 생성된 브리핑</span>
          <strong>5개 뉴스</strong>
          <p>정책, 사회, 경제, 환경, 문화 이슈를 건축적 흐름으로 재분류했습니다.</p>
          <button onClick={() => window.scrollTo({ top: 760, behavior: "smooth" })}>
            브리핑 확인
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>사용자 설정</h2>
            <p className="sub">에이전트가 뉴스 필터링에 사용하는 관심 정보입니다.</p>

            <label>수신 이메일</label>
            <input
              value={email}
              placeholder="실제 받을 이메일을 입력하세요"
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>현재 프로젝트</label>
            <textarea value={project} onChange={(e) => setProject(e.target.value)} />

            <label>관심 키워드</label>
            <div className="chips">
              {keywords.map((k) => (
                <span className="chip dark" key={k}>{k}</span>
              ))}
            </div>

            <div className="keyword-row">
              <input
                value={keywordInput}
                placeholder="키워드 추가"
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <button onClick={addKeyword}>추가</button>
            </div>

            <button className="mail-button" onClick={sendEmail} disabled={isSending}>
              {isSending ? "전송 중..." : "브리핑 메일 보내기"}
            </button>
            {status && <p className="notice">{status}</p>}

            <div className="small-info">
              <strong>자동 발송 설정</strong>
              <p>Vercel 환경변수에 RECIPIENT_EMAIL을 설정하면 매일 오전 8시경 자동 발송됩니다.</p>
            </div>
          </section>

          <section className="panel">
            <h2>에이전트 작동 흐름</h2>
            <ol className="steps">
              <li>사용자 관심사 저장</li>
              <li>매일 아침 뉴스 수집</li>
              <li>뉴스 요약 및 분류</li>
              <li>공통 사회 흐름 도출</li>
              <li>건축 분야 영향 종합 분석</li>
              <li>이메일·대시보드 전달</li>
            </ol>
          </section>
        </aside>

        <section className="briefing">
          <div className="briefing-head">
            <div>
              <span>2026.05.19</span>
              <h2>오늘의 건축 시사 브리핑</h2>
            </div>
            <div className="chips">
              <span className="chip">자동 생성</span>
              <span className="chip">건축 영향 분석</span>
            </div>
          </div>

          <section className="block">
            <h3>1. 오늘의 주요 뉴스</h3>
            <p className="sub">뉴스는 개별 해석보다 먼저 짧게 정리합니다. 각 뉴스는 클릭하면 관련 뉴스 페이지로 이동합니다.</p>

            <div className="news-list">
              {newsItems.map((news, index) => (
                <a
                  className="news-card"
                  href={news.url}
                  target="_blank"
                  rel="noreferrer"
                  key={news.title}
                  title="관련 뉴스 페이지 열기"
                >
                  <div className="news-top">
                    <span>{news.category}</span>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                  </div>
                  <h4>{news.title}</h4>
                  <p>{news.summary}</p>
                  <div className="news-bottom">
                    <div className="chips">
                      {news.tags.map((t) => (
                        <span className="chip" key={t}>{t}</span>
                      ))}
                    </div>
                    <strong>기사 페이지 열기 ↗</strong>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="block dark-block">
            <h3>2. 오늘의 공통 흐름</h3>
            <p>{commonFlow}</p>
          </section>

          <section className="block">
            <h3>3. 건축 분야에 미칠 종합 영향</h3>
            <div className="impact-grid">
              {impacts.map((impact, index) => (
                <div className="impact" key={impact}>
                  <span>{index + 1}</span>
                  <p>{impact}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="block">
            <h3>4. 오늘의 설계 키워드</h3>
            <div className="chips big">
              {["기존 도시조직", "복합 프로그램", "생활 인프라", "반외부공간", "도심 물류", "공공공간", "리노베이션", "기후 대응"].map((k) => (
                <span className="chip dark" key={k}>{k}</span>
              ))}
            </div>
          </section>

          <section className="question">
            <strong>오늘의 건축적 질문</strong>
            <p>
              앞으로 건축은 새로운 형태를 만드는 것보다, 기존 도시 안에서
              주거·상업·물류·돌봄·기후 대응 기능을 어떻게 함께 조직할 것인가?
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
