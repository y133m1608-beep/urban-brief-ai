
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const initialKeywords = ["도시재생", "전통시장", "공중가로", "물류", "주거", "기후대응", "공공공간"];

function App() {
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("남대문시장 C·D동 리노베이션");
  const [keywords, setKeywords] = useState(() => {
    try {
      const saved = localStorage.getItem("urbanBriefKeywords");
      return saved ? JSON.parse(saved) : initialKeywords;
    } catch {
      return initialKeywords;
    }
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [appliedKeywords, setAppliedKeywords] = useState([]);

  const commonFlow =
    "오늘의 뉴스들은 사용자가 입력한 관심 키워드를 중심으로 수집되었다. 개별 뉴스는 서로 다른 이슈처럼 보이지만, 건축과 도시공간은 이 흐름을 프로그램, 동선, 공공공간, 생활 인프라의 재조직 문제로 해석할 수 있다.";

  const impacts = [
    "관심 키워드는 설계 리서치의 필터가 되며, 매일 바뀌는 사회 이슈를 프로젝트와 연결하는 기준이 된다.",
    "정책·사회·경제 뉴스는 건축 프로그램의 근거, 도시 맥락 설명, 발표 서론의 자료로 전환될 수 있다.",
    "뉴스에서 반복적으로 등장하는 이슈는 주거, 상업, 물류, 공공공간 등 건축 프로그램의 변화로 이어질 수 있다.",
    "건축가는 뉴스 자체보다 그 뉴스들이 만드는 공간적 요구와 생활 방식의 변화를 읽는 역할을 하게 된다."
  ];

  useEffect(() => {
    localStorage.setItem("urbanBriefKeywords", JSON.stringify(keywords));
  }, [keywords]);

  const loadNews = async (nextKeywords = keywords) => {
    setIsLoadingNews(true);
    setStatus("입력한 관심 키워드로 최신 뉴스를 불러오는 중입니다...");
    try {
      const query = encodeURIComponent(nextKeywords.join(","));
      const response = await fetch(`/api/news?keywords=${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "뉴스를 불러오지 못했습니다.");
      setNewsItems(data.newsItems || []);
      setAppliedKeywords(data.appliedKeywords || nextKeywords);
      setUpdatedAt(data.updatedAt || "");
      setStatus("입력한 관심 키워드가 적용되었습니다.");
    } catch (error) {
      setStatus(error.message || "뉴스 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    loadNews(keywords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value) return;
    const next = keywords.includes(value) ? keywords : [...keywords, value];
    setKeywords(next);
    setKeywordInput("");
    loadNews(next);
  };

  const removeKeyword = (value) => {
    const next = keywords.filter((item) => item !== value);
    setKeywords(next);
    loadNews(next);
  };

  const resetKeywords = () => {
    setKeywords(initialKeywords);
    loadNews(initialKeywords);
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      setStatus("수신 이메일을 먼저 입력하세요.");
      return;
    }

    setIsSending(true);
    setStatus("입력한 관심 키워드로 메일을 보내는 중입니다...");

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
          <div className="eyebrow">관심 키워드 기반 최신 뉴스 브리핑</div>
          <h1>Urban Brief AI</h1>
          <p>
            사용자가 직접 입력한 관심 키워드로 최신 뉴스를 수집하고, 여러 뉴스에서 나타나는
            공통 흐름이 건축 분야에 미칠 영향을 종합적으로 분석하는 건축 시사 에이전트입니다.
          </p>
        </div>
        <div className="hero-card">
          <span>현재 적용된 키워드</span>
          <strong>{keywords.length}개</strong>
          <p>키워드를 추가하거나 삭제하면 뉴스 목록이 다시 업데이트됩니다.</p>
          <button onClick={() => loadNews(keywords)} disabled={isLoadingNews}>{isLoadingNews ? "업데이트 중..." : "관심 키워드로 업데이트"}</button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>사용자 설정</h2>
            <p className="sub">관심 키워드를 추가하면 그 키워드가 바로 뉴스 검색에 적용됩니다.</p>
            <label>수신 이메일</label>
            <input value={email} placeholder="실제 받을 이메일을 입력하세요" onChange={(e) => setEmail(e.target.value)} />
            <label>현재 프로젝트</label>
            <textarea value={project} onChange={(e) => setProject(e.target.value)} />
            <label>관심 키워드</label>
            <div className="chips">{keywords.map((k) => <button className="chip dark removable" key={k} onClick={() => removeKeyword(k)} title="클릭하면 삭제됩니다">{k} ×</button>)}</div>
            <div className="keyword-row">
              <input value={keywordInput} placeholder="예: 한옥, 리모델링, 공공주거" onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKeyword()} />
              <button onClick={addKeyword}>추가</button>
            </div>
            <div className="sub-actions">
              <button onClick={() => loadNews(keywords)} disabled={isLoadingNews}>키워드 적용</button>
              <button onClick={resetKeywords}>초기화</button>
            </div>
            <button className="mail-button" onClick={sendEmail} disabled={isSending}>{isSending ? "전송 중..." : "브리핑 메일 보내기"}</button>
            {status && <p className="notice">{status}</p>}
            <div className="small-info">
              <strong>내일 아침 자동 메일 주의</strong>
              <p>웹사이트에서 입력한 키워드는 화면과 수동 메일에 바로 적용됩니다. 매일 오전 8시 자동 메일은 Vercel 환경변수 KEYWORDS에 들어간 값으로 실행됩니다.</p>
            </div>
          </section>

          <section className="panel">
            <h2>에이전트 작동 흐름</h2>
            <ol className="steps">
              <li>사용자 관심 키워드 입력</li>
              <li>입력 키워드로 최신 뉴스 수집</li>
              <li>기사 원문 링크 연결</li>
              <li>뉴스 간 공통 흐름 도출</li>
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
            <div className="chips">{(appliedKeywords.length ? appliedKeywords : keywords).slice(0, 4).map((k) => <span className="chip" key={k}>{k}</span>)}</div>
          </div>

          <section className="block">
            <h3>1. 오늘의 주요 뉴스</h3>
            <p className="sub">뉴스 카드는 기사 원문 링크로 이동합니다. 관련성이 낮은 뉴스는 줄이기 위해 키워드에 ‘건축·도시·공간’ 조건을 함께 적용했습니다.</p>
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

          <section className="question">
            <strong>오늘의 건축적 질문</strong>
            <p>오늘 입력한 관심 키워드들은 실제 도시와 사회 뉴스 안에서 어떤 공간적 요구로 나타나고 있는가?</p>
          </section>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
