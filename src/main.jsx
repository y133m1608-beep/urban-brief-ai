
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const defaultCategories = [
  { name: "정책 / 제도", keywords: ["주거정책", "도시계획"] },
  { name: "경제 / 부동산", keywords: ["부동산시장", "지역상권"] },
  { name: "사회 / 인구", keywords: ["고령화", "1인가구"] },
  { name: "도시 / 지역", keywords: ["도시재생", "교통인프라"] },
  { name: "환경 / 기후", keywords: ["기후위기", "재난대응"] },
  { name: "기술 / 산업", keywords: ["AI", "도심물류"] },
  { name: "문화 / 생활", keywords: ["관광", "소비트렌드"] }
];

const architectureKeywords = [
  "복합 프로그램",
  "생활 인프라",
  "반외부공간",
  "도시재생",
  "보행환경",
  "도심 물류",
  "공공공간",
  "리노베이션",
  "기후 대응"
];

function flattenKeywords(categories) {
  return categories.flatMap((category) => category.keywords).filter(Boolean);
}

function App() {
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("건축 시사 브리핑");
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("urbanBriefCategories");
      return saved ? JSON.parse(saved) : defaultCategories;
    } catch {
      return defaultCategories;
    }
  });
  const [keywordInputs, setKeywordInputs] = useState({});
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const keywords = useMemo(() => flattenKeywords(categories), [categories]);

  const commonFlow =
    "오늘의 뉴스는 정책, 경제, 사회, 도시, 환경, 기술, 문화 흐름을 함께 읽기 위해 수집되었다. 건축은 이 변화들을 단순한 사건이 아니라 주거, 공공공간, 인프라, 상업공간, 생활 방식의 변화로 번역해야 한다.";

  const impacts = [
    "건축은 사회 전반의 흐름을 읽고, 이를 공간 프로그램과 도시 구조의 변화로 해석하는 역할을 요구받는다.",
    "정책·경제·인구·기후·기술 이슈는 건축의 규모, 용도, 운영 방식, 공공성에 직접적인 영향을 준다.",
    "문화와 생활 방식의 변화는 상업공간, 공공공간, 주거공간의 경험 방식과 체류 방식을 변화시킨다.",
    "건축 에이전트는 뉴스 자체보다 여러 뉴스가 함께 만들어내는 공간적 요구를 파악하는 데 목적이 있다."
  ];

  useEffect(() => {
    localStorage.setItem("urbanBriefCategories", JSON.stringify(categories));
  }, [categories]);

  const loadNews = async (nextCategories = categories) => {
    const nextKeywords = flattenKeywords(nextCategories);
    const refresh = Date.now();

    setIsLoadingNews(true);
    setStatus("최신 뉴스를 다시 불러오는 중입니다...");

    try {
      const query = encodeURIComponent(nextKeywords.join(","));
      const response = await fetch(`/api/news?keywords=${query}&refresh=${refresh}`, {
        cache: "no-store"
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "뉴스를 불러오지 못했습니다.");

      setNewsItems(data.newsItems || []);
      setUpdatedAt(data.updatedAt || "");
      setRefreshCount((count) => count + 1);
      setStatus("최신 뉴스가 업데이트되었습니다. 새 기사가 없으면 목록이 이전과 같을 수 있습니다.");
    } catch (error) {
      setStatus(error.message || "뉴스 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    loadNews(categories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addKeyword = (categoryName) => {
    const value = (keywordInputs[categoryName] || "").trim();
    if (!value) return;

    const next = categories.map((category) => {
      if (category.name !== categoryName) return category;
      if (category.keywords.includes(value)) return category;
      return { ...category, keywords: [...category.keywords, value] };
    });

    setCategories(next);
    setKeywordInputs({ ...keywordInputs, [categoryName]: "" });
    loadNews(next);
  };

  const removeKeyword = (categoryName, keyword) => {
    const next = categories.map((category) => {
      if (category.name !== categoryName) return category;
      return { ...category, keywords: category.keywords.filter((item) => item !== keyword) };
    });

    setCategories(next);
    loadNews(next);
  };

  const resetCategories = () => {
    setCategories(defaultCategories);
    setKeywordInputs({});
    loadNews(defaultCategories);
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      setStatus("수신 이메일을 먼저 입력하세요.");
      return;
    }

    setIsSending(true);
    setStatus("분야별 관심 키워드로 메일을 보내는 중입니다...");

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
          <div className="eyebrow">7개 분야 기반 건축 시사 브리핑</div>
          <h1>Urban Brief AI</h1>
          <p>
            정책·경제·사회·도시·환경·기술·문화 흐름을 함께 읽고,
            여러 뉴스가 건축과 도시공간에 미칠 영향을 종합적으로 분석하는 에이전트입니다.
          </p>
        </div>
        <div className="hero-card">
          <span>오늘 생성된 브리핑</span>
          <strong>{newsItems.length || 0}개 뉴스</strong>
          <p>관심 키워드 기반 최신 뉴스를 건축적 흐름으로 재분류합니다.</p>
          <button onClick={() => loadNews(categories)} disabled={isLoadingNews}>
            {isLoadingNews ? "업데이트 중..." : "최신 뉴스 업데이트"}
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>사용자 설정</h2>
            <p className="sub">건축이 읽어야 할 사회 흐름을 7개 분야로 나누어 설정합니다.</p>
            <label>수신 이메일</label>
            <input value={email} placeholder="실제 받을 이메일을 입력하세요" onChange={(e) => setEmail(e.target.value)} />
            <label>브리핑 주제</label>
            <textarea value={project} onChange={(e) => setProject(e.target.value)} />

            <div className="category-list">
              {categories.map((category) => (
                <div className="category-card" key={category.name}>
                  <div className="category-title">{category.name}</div>
                  <div className="chips">
                    {category.keywords.map((keyword) => (
                      <button
                        className="chip dark removable"
                        key={keyword}
                        onClick={() => removeKeyword(category.name, keyword)}
                        title="클릭하면 삭제됩니다"
                      >
                        {keyword} ×
                      </button>
                    ))}
                  </div>
                  <div className="keyword-row">
                    <input
                      value={keywordInputs[category.name] || ""}
                      placeholder="키워드 추가"
                      onChange={(e) => setKeywordInputs({ ...keywordInputs, [category.name]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addKeyword(category.name)}
                    />
                    <button onClick={() => addKeyword(category.name)}>추가</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sub-actions">
              <button onClick={() => loadNews(categories)} disabled={isLoadingNews}>키워드 적용</button>
              <button onClick={resetCategories}>초기화</button>
            </div>
            <button className="mail-button" onClick={sendEmail} disabled={isSending}>{isSending ? "전송 중..." : "브리핑 메일 보내기"}</button>
            {status && <p className="notice">{status}</p>}
            <div className="small-info">
              <strong>업데이트 안내</strong>
              <p>최신 뉴스 업데이트 버튼은 네이버 뉴스 API를 다시 호출합니다. 같은 시각에 새 기사가 없으면 목록이 이전과 같을 수 있습니다.</p>
            </div>
          </section>

          <section className="panel">
            <h2>에이전트 작동 흐름</h2>
            <ol className="steps">
              <li>7개 뉴스 분야 설정</li>
              <li>분야별 관심 키워드로 최신 뉴스 수집</li>
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
              <span>{formattedUpdatedAt ? `업데이트: ${formattedUpdatedAt} · 새로고침 ${refreshCount}회` : "최신 뉴스 로딩 중"}</span>
              <h2>오늘의 건축 시사 브리핑</h2>
            </div>
            <div className="chips">{categories.map((c) => <span className="chip" key={c.name}>{c.name}</span>)}</div>
          </div>

          <section className="block">
            <h3>1. 오늘의 주요 뉴스</h3>
            <p className="sub">정책·경제·사회·도시·환경·기술·문화 키워드로 최신 뉴스를 수집합니다. 뉴스 카드는 기사 원문 링크로 이동합니다.</p>
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
            <h3>4. 오늘의 건축 키워드</h3>
            <p className="sub">뉴스를 건축적으로 읽기 위해 추출한 공간·프로그램 중심 키워드입니다.</p>
            <div className="chips big">
              {architectureKeywords.map((keyword) => (
                <span className="chip dark" key={keyword}>{keyword}</span>
              ))}
            </div>
          </section>

          <section className="question">
            <strong>오늘의 건축적 질문</strong>
            <p>정책, 경제, 사회, 도시, 환경, 기술, 문화 변화는 앞으로 어떤 공간 프로그램과 도시 구조를 요구하게 될까?</p>
          </section>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
