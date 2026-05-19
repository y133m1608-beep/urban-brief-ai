
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const initialKeywords = ["도시재생", "전통시장", "공중가로", "물류", "주거", "기후대응", "공공공간"];

function App() {
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("남대문시장 C·D동 리노베이션");
  const [keywords, setKeywords] = useState(initialKeywords);
  const [keywordInput, setKeywordInput] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");

  const commonFlow =
    "오늘의 뉴스들은 공통적으로 기존 도시공간을 단순히 새로 개발하는 것이 아니라, 생활 인프라로 다시 조직하려는 흐름을 보여준다. 정책, 사회, 경제, 환경 이슈는 서로 다른 뉴스처럼 보이지만 모두 기존 도시조직 안에서 새로운 기능을 수용하고 연결하는 문제로 이어진다.";

  const impacts = [
    "기존 건축물과 도시조직을 철거하기보다, 새로운 프로그램을 삽입하고 재구성하는 리노베이션 전략이 중요해진다.",
    "주거, 상업, 물류, 돌봄, 공공공간이 하나의 생활권 안에서 복합적으로 결합될 가능성이 커진다.",
    "기후 변화에 대응하기 위해 그늘, 캐노피, 중정, 공중가로, 테라스 같은 반외부공간이 도시 인프라로 다뤄질 수 있다.",
    "건축가는 형태를 만드는 역할을 넘어 사회적 변화와 공간 프로그램 사이의 관계를 조직하는 역할을 요구받게 된다."
  ];

  const loadNews = async () => {
    setIsLoadingNews(true);
    setStatus("최신 뉴스를 불러오는 중입니다...");
    try {
      const query = encodeURIComponent(keywords.join(","));
      const response = await fetch(`/api/news?keywords=${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "뉴스를 불러오지 못했습니다.");
      setNewsItems(data.newsItems || []);
      setUpdatedAt(data.updatedAt || "");
      setStatus("최신 뉴스가 업데이트되었습니다.");
    } catch (error) {
      setStatus(error.message || "뉴스 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setStatus("최신 뉴스로 메일을 보내는 중입니다...");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: email.trim(), project, keywords })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "메일 발송에 실패했습니다.");
      if (data.newsItems) setNewsItems(data.newsItems);
      setStatus("메일이 전송되었습니다. 받은 편지함 또는 스팸함을 확인하세요.");
    } catch (error) {
      setStatus(error.message || "메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const formattedUpdatedAt = updatedAt
    ? new Date(updatedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })
    : "";

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="eyebrow">매일 오전 8시 최신 뉴스 자동 브리핑</div>
          <h1>Urban Brief AI</h1>
          <p>
            네이버 뉴스 검색 API로 최신 뉴스를 가져오고, 여러 뉴스에서 나타나는
            공통 흐름이 건축 분야에 미칠 영향을 종합적으로 분석하는 건축 시사 에이전트입니다.
          </p>
        </div>
        <div className="hero-card">
          <span>오늘 생성된 브리핑</span>
          <strong>{newsItems.length || 5}개 뉴스</strong>
          <p>관심 키워드 기반 최신 뉴스를 건축적 흐름으로 재분류합니다.</p>
          <button onClick={loadNews} disabled={isLoadingNews}>{isLoadingNews ? "업데이트 중..." : "최신 뉴스 업데이트"}</button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>사용자 설정</h2>
            <p className="sub">에이전트가 뉴스 필터링에 사용하는 관심 정보입니다.</p>
            <label>수신 이메일</label>
            <input value={email} placeholder="실제 받을 이메일을 입력하세요" onChange={(e) => setEmail(e.target.value)} />
            <label>현재 프로젝트</label>
            <textarea value={project} onChange={(e) => setProject(e.target.value)} />
            <label>관심 키워드</label>
            <div className="chips">{keywords.map((k) => <span className="chip dark" key={k}>{k}</span>)}</div>
            <div className="keyword-row">
              <input value={keywordInput} placeholder="키워드 추가" onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKeyword()} />
              <button onClick={addKeyword}>추가</button>
            </div>
            <button className="mail-button" onClick={sendEmail} disabled={isSending}>{isSending ? "전송 중..." : "브리핑 메일 보내기"}</button>
            {status && <p className="notice">{status}</p>}
            <div className="small-info">
              <strong>자동 발송 설정</strong>
              <p>Vercel 환경변수에 RECIPIENT_EMAIL을 설정하면 매일 오전 8시경 최신 뉴스로 자동 발송됩니다.</p>
            </div>
          </section>

          <section className="panel">
            <h2>에이전트 작동 흐름</h2>
            <ol className="steps">
              <li>사용자 관심사 저장</li>
              <li>네이버 뉴스 API로 최신 뉴스 수집</li>
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
              <span>{formattedUpdatedAt ? `업데이트: ${formattedUpdatedAt}` : "최신 뉴스 로딩 중"}</span>
              <h2>오늘의 건축 시사 브리핑</h2>
            </div>
            <div className="chips"><span className="chip">실시간 뉴스</span><span className="chip">건축 영향 분석</span></div>
          </div>

          <section className="block">
            <h3>1. 오늘의 주요 뉴스</h3>
            <p className="sub">뉴스 카드를 클릭하면 네이버 검색 결과가 아니라 기사 원문 또는 네이버 뉴스 원문으로 이동합니다.</p>
            <div className="news-list">
              {newsItems.map((news, index) => (
                <a className="news-card" href={news.url} target="_blank" rel="noreferrer" key={`${news.title}-${index}`}>
                  <div className="news-top"><span>{news.category}</span><em>{String(index + 1).padStart(2, "0")}</em></div>
                  <h4>{news.title}</h4>
                  <p>{news.summary}</p>
                  <div className="news-bottom">
                    <div className="chips">{(news.tags || []).map((t) => <span className="chip" key={t}>{t}</span>)}</div>
                    <strong>기사 원문 열기 ↗</strong>
                  </div>
                </a>
              ))}
              {!newsItems.length && <div className="empty">뉴스를 불러오는 중입니다.</div>}
            </div>
          </section>

          <section className="block dark-block"><h3>2. 오늘의 공통 흐름</h3><p>{commonFlow}</p></section>

          <section className="block">
            <h3>3. 건축 분야에 미칠 종합 영향</h3>
            <div className="impact-grid">{impacts.map((impact, index) => <div className="impact" key={impact}><span>{index + 1}</span><p>{impact}</p></div>)}</div>
          </section>

          <section className="block">
            <h3>4. 오늘의 설계 키워드</h3>
            <div className="chips big">{["기존 도시조직", "복합 프로그램", "생활 인프라", "반외부공간", "도심 물류", "공공공간", "리노베이션", "기후 대응"].map((k) => <span className="chip dark" key={k}>{k}</span>)}</div>
          </section>

          <section className="question">
            <strong>오늘의 건축적 질문</strong>
            <p>앞으로 건축은 새로운 형태를 만드는 것보다, 기존 도시 안에서 주거·상업·물류·돌봄·기후 대응 기능을 어떻게 함께 조직할 것인가?</p>
          </section>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
