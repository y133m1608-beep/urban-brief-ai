
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
  { name: "문화 / 생활", keywords: ["관광", "소비트렌드"] },
  { name: "국제 / 정세", keywords: ["국제분쟁", "에너지", "세계경제", "공급망", "기후외교", "미국대선", "중국경제"] }
];

const defaultArchitectureKeywords = [
  "복합 프로그램",
  "생활 인프라",
  "공공공간",
  "도시재생",
  "보행환경",
  "리노베이션",
  "기후 대응"
];

function flattenKeywords(categories) {
  return categories.flatMap((category) => category.keywords).filter(Boolean);
}


function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function ArticleDrawer({ group, onClose }) {
  if (!group) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span>분야별 기사 목록</span>
            <h2>{group.category}</h2>
          </div>
          <button onClick={onClose}>닫기</button>
        </div>
        <p className="drawer-desc">
          대표 기사 외에 같은 분야에서 함께 수집된 기사들입니다. 국제/정세 분야는 국내 보도와 해외 원문을 함께 보여줍니다.
        </p>
        <div className="drawer-list">
          {group.articles.map((article, index) => (
            <a className="drawer-article" href={article.url} target="_blank" rel="noreferrer" key={`${article.title}-${index}`}>
              <div className="news-top">
                <span>{article.keyword || group.category}</span>
                <em>{String(index + 1).padStart(2, "0")}</em>
              </div>
              <h3>{article.title}</h3>
              <div className="news-meta">{article.source || "뉴스"}{formatNewsDate(article.publishedAt) ? ` · ${formatNewsDate(article.publishedAt)}` : ""}</div>
              <p>{article.summary}</p>
              <strong>기사 원문 열기 ↗</strong>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
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
  const [groupedNews, setGroupedNews] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [architectureKeywords, setArchitectureKeywords] = useState(defaultArchitectureKeywords);
  const [architecturalQuestion, setArchitecturalQuestion] = useState("오늘 뉴스 흐름을 바탕으로 건축적 질문을 생성하는 중입니다.");

  const keywords = useMemo(() => flattenKeywords(categories), [categories]);

  const newsItems = groupedNews.map((group) => group.representative).filter(Boolean);

  const [commonFlow, setCommonFlow] = useState("오늘 뉴스 흐름을 바탕으로 공통 흐름을 분석하는 중입니다.");

  const [architecturalImpacts, setArchitecturalImpacts] = useState([
    "오늘 뉴스 흐름을 바탕으로 건축 분야에 미칠 영향을 분석하는 중입니다.",
    "뉴스가 업데이트되면 이 문장들도 함께 바뀝니다.",
    "OpenAI API가 있으면 AI 기반 분석을 사용하고, 없으면 규칙 기반 분석으로 대체됩니다.",
    "각 항목은 오늘의 뉴스 흐름과 건축·도시공간의 연결을 중심으로 생성됩니다."
  ]);

  useEffect(() => {
    localStorage.setItem("urbanBriefCategories", JSON.stringify(categories));
  }, [categories]);

  const loadNews = async (nextCategories = categories) => {
    const refresh = Date.now();

    setIsLoadingNews(true);
    setStatus("8개 분야에서 최신 대표 기사와 관련 기사 목록을 불러오는 중입니다...");

    try {
      const categoryParam = encodeURIComponent(JSON.stringify(nextCategories));
      const response = await fetch(`/api/news?categories=${categoryParam}&refresh=${refresh}`, {
        cache: "no-store"
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "뉴스를 불러오지 못했습니다.");

      setGroupedNews(data.groupedNews || []);
      if (data.question) setArchitecturalQuestion(data.question);
      if (data.impacts) setArchitecturalImpacts(data.impacts);
      if (data.commonFlow) setCommonFlow(data.commonFlow);
      if (data.architectureKeywords) setArchitectureKeywords(data.architectureKeywords);
      setUpdatedAt(data.updatedAt || "");
      setRefreshCount((count) => count + 1);
      setStatus("분야별 최신 대표 기사와 관련 기사 목록이 업데이트되었습니다.");
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
    setStatus("8개 분야 뉴스로 메일을 보내는 중입니다...");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: email.trim(), project, keywords, categories })
      });
      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(rawText || "서버가 JSON이 아닌 응답을 반환했습니다.");
      }
      if (!response.ok) throw new Error(data.error || "메일 발송에 실패했습니다.");
      if (data.groupedNews) setGroupedNews(data.groupedNews);
      if (data.impacts) setArchitecturalImpacts(data.impacts);
      if (data.architectureKeywords) setArchitectureKeywords(data.architectureKeywords);
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
          <div className="eyebrow">8개 분야 균형형 건축 시사 브리핑</div>
          <h1>Urban Brief AI</h1>
          <p>
            정책·경제·사회·도시·환경·기술·문화·국제정세 흐름을 균형 있게 읽고,
            대표 기사와 관련 기사 목록을 통해 사회 이슈를 건축적으로 해석하는 에이전트입니다.
          </p>
        </div>
        <div className="hero-card">
          <span>오늘 생성된 브리핑</span>
          <strong>{newsItems.length || 0}개 대표 뉴스</strong>
          <p>각 분야의 최신 대표 기사를 누르면 관련 최신 기사 목록을 볼 수 있습니다. 국제/정세는 국내 보도와 해외 원문을 함께 보여줍니다.</p>
          <button onClick={() => loadNews(categories)} disabled={isLoadingNews}>
            {isLoadingNews ? "업데이트 중..." : "최신 뉴스 업데이트"}
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <section className="panel">
            <h2>사용자 설정</h2>
            <p className="sub">건축이 읽어야 할 사회 흐름을 8개 분야로 나누어 설정합니다.</p>
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
              <strong>기사 목록 방식</strong>
              <p>메인에는 분야별 대표 기사가 보이고, 대표 카드를 누르면 해당 분야의 기사 여러 개가 열립니다.</p>
            </div>
          </section>

          <section className="panel">
            <h2>에이전트 작동 흐름</h2>
            <ol className="steps">
              <li>7개 뉴스 분야 설정</li>
              <li>분야별 대표 기사와 관련 기사 수집</li>
              <li>대표 기사 클릭 시 기사 목록 표시</li>
              <li>기사 목록에서 원문 링크 이동</li>
              <li>뉴스 간 공통 흐름 도출</li>
              <li>건축 분야 영향 종합 분석</li>
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
            <p className="sub">각 카드는 분야별 최신 대표 기사입니다. 카드를 누르면 같은 분야의 최신 기사 목록이 열리고, 목록 안에서 기사 원문으로 이동할 수 있습니다.</p>
            <div className="news-list">
              {groupedNews.map((group, index) => {
                const news = group.representative;
                return (
                  <button className="news-card as-button" onClick={() => setSelectedGroup(group)} key={`${group.category}-${index}`}>
                    <div className="news-top"><span>{group.category}</span><em>{String(index + 1).padStart(2, "0")}</em></div>
                    <h4>{news.title}</h4>
                    <div className="news-meta">{news.source || "뉴스"}{formatNewsDate(news.publishedAt) ? ` · ${formatNewsDate(news.publishedAt)}` : ""}</div>
                    <p>{news.summary}</p>
                    <div className="news-bottom">
                      <div className="chips">{(news.tags || []).map((t) => <span className="chip" key={t}>{t}</span>)}</div>
                      <strong>이 분야 기사 {group.articles.length}개 보기 →</strong>
                    </div>
                  </button>
                );
              })}
              {!groupedNews.length && <div className="empty">뉴스를 불러오는 중입니다.</div>}
            </div>
          </section>

          <section className="block dark-block"><h3>2. 오늘의 공통 흐름</h3><p>{commonFlow}</p></section>

          <section className="block">
            <h3>3. 건축 분야에 미칠 종합 영향</h3>
            <div className="impact-grid">{architecturalImpacts.map((impact, index) => <div className="impact" key={impact}><span>{index + 1}</span><p>{impact}</p></div>)}</div>
          </section>

          <section className="block">
            <h3>4. 오늘의 건축 키워드</h3>
            <p className="sub">오늘 수집된 뉴스 흐름을 건축적으로 읽기 위해 AI가 추출한 공간·프로그램 중심 키워드입니다.</p>
            <div className="chips big">
              {architectureKeywords.map((keyword) => (
                <span className="chip dark" key={keyword}>{keyword}</span>
              ))}
            </div>
          </section>

          <section className="question">
            <strong>오늘의 건축적 질문</strong>
            <p>{architecturalQuestion}</p>
          </section>
        </section>
      </main>

      <ArticleDrawer group={selectedGroup} onClose={() => setSelectedGroup(null)} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
