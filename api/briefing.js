
const defaultKeywords = ["도시재생", "전통시장", "공중가로", "물류", "주거", "기후대응", "공공공간"];

const architectureWords = [
  "건축", "도시", "공간", "주거", "상업", "상권", "시장", "개발", "재생",
  "정비", "보행", "도로", "공원", "시설", "인프라", "물류", "기후", "환경",
  "계획", "설계", "재개발", "재건축", "복합", "건물", "건설", "도심"
];

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeKeyword(value) {
  return String(value || "").trim();
}

function normalizeNaverItem(item, keyword, query) {
  return {
    category: keyword,
    title: stripHtml(item.title),
    summary: stripHtml(item.description),
    url: item.originallink || item.link,
    naverUrl: item.link,
    publishedAt: item.pubDate || "",
    tags: [keyword, "건축", "도시"].filter(Boolean).slice(0, 3),
    query
  };
}

function isRelevant(item, keyword) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const normalizedKeyword = String(keyword || "").toLowerCase();

  if (normalizedKeyword && text.includes(normalizedKeyword)) return true;

  const hasArchitectureWord = architectureWords.some((word) => text.includes(word.toLowerCase()));
  return hasArchitectureWord;
}

function createSearchQueries(keywords = []) {
  const selected = Array.isArray(keywords) && keywords.length ? keywords : defaultKeywords;

  return selected
    .map(normalizeKeyword)
    .filter(Boolean)
    .slice(0, 8)
    .flatMap((keyword) => [
      { keyword, query: `${keyword} 건축 도시` },
      { keyword, query: `${keyword} 도시공간` },
      { keyword, query: `${keyword} 정책 공간` }
    ]);
}

async function fetchNaverNews({ keywords = [], display = 5 } = {}) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return getFallbackNews(keywords);
  }

  const queries = createSearchQueries(keywords);
  const results = [];
  const seen = new Set();

  for (const search of queries) {
    const url = new URL("https://openapi.naver.com/v1/search/news.json");
    url.searchParams.set("query", search.query);
    url.searchParams.set("display", "5");
    url.searchParams.set("start", "1");
    url.searchParams.set("sort", "date");

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret
        }
      });

      if (!response.ok) continue;

      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];

      for (const item of items) {
        const normalized = normalizeNaverItem(item, search.keyword, search.query);
        const key = normalized.url || normalized.title;
        if (!key || seen.has(key)) continue;

        if (!isRelevant(normalized, search.keyword)) continue;

        seen.add(key);
        results.push(normalized);
        break;
      }

      if (results.length >= display) break;
    } catch (error) {
      continue;
    }
  }

  return results.length ? results.slice(0, display) : getFallbackNews(keywords);
}

function getFallbackNews(keywords = []) {
  const selected = Array.isArray(keywords) && keywords.length ? keywords : defaultKeywords;
  return selected.slice(0, 5).map((keyword, index) => ({
    category: keyword,
    title: `${keyword} 관련 최신 뉴스가 부족하여 기본 브리핑 항목을 표시합니다`,
    summary: "현재 키워드와 정확히 맞는 최신 뉴스가 부족합니다. 관심 키워드를 더 넓게 입력하거나, ‘도시·건축·정책’과 함께 검색해보세요.",
    url: "https://news.naver.com/",
    publishedAt: "",
    tags: [keyword, "건축", "도시"].filter(Boolean)
  }));
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function createBriefingHtml({ project = "건축 프로젝트", keywords = [], newsItems = [] } = {}) {
  const keywordText = Array.isArray(keywords) && keywords.length ? keywords.join(", ") : defaultKeywords.join(", ");
  const items = newsItems.length ? newsItems : getFallbackNews(keywords);

  const newsHtml = items.map((news, index) => `
    <tr>
      <td style="padding:18px 0;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 6px;color:#64748b;font-size:13px;font-weight:700;">${index + 1}. ${news.category}${formatDate(news.publishedAt) ? " · " + formatDate(news.publishedAt) : ""}</p>
        <h3 style="margin:0 0 8px;font-size:18px;color:#111827;">${news.title}</h3>
        <p style="margin:0 0 10px;color:#374151;line-height:1.65;font-size:14px;">${news.summary}</p>
        <a href="${news.url}" target="_blank" style="color:#111827;font-weight:700;">기사 원문 열기 ↗</a>
      </td>
    </tr>
  `).join("");

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;padding:32px;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:14px;font-weight:700;">Urban Brief AI</p>
      <h1 style="margin:0 0 18px;color:#111827;font-size:30px;letter-spacing:-0.04em;">오늘의 건축 시사 브리핑</h1>
      <p style="margin:0 0 20px;color:#374151;line-height:1.7;">
        현재 프로젝트: <strong>${project}</strong><br/>
        적용된 관심 키워드: ${keywordText}
      </p>
      <h2 style="margin:28px 0 6px;color:#111827;font-size:22px;">1. 오늘의 주요 뉴스</h2>
      <table style="width:100%;border-collapse:collapse;">${newsHtml}</table>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">2. 오늘의 공통 흐름</h2>
      <p style="margin:0;color:#374151;line-height:1.75;">
        오늘의 뉴스들은 사용자가 입력한 관심 키워드를 중심으로 수집되었다.
        개별 뉴스는 서로 다른 이슈처럼 보이지만, 건축과 도시공간은 이 흐름을 프로그램, 동선, 공공공간, 생활 인프라의 재조직 문제로 해석할 수 있다.
      </p>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">3. 건축 분야에 미칠 종합 영향</h2>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;">
        <li>사용자의 관심 키워드는 설계 리서치의 필터가 되며, 매일 바뀌는 사회 이슈를 프로젝트와 연결하는 기준이 된다.</li>
        <li>정책·사회·경제 뉴스는 건축 프로그램의 근거, 도시 맥락 설명, 발표 서론의 자료로 전환될 수 있다.</li>
        <li>건축가는 뉴스 자체보다 그 뉴스들이 만드는 공간적 요구와 생활 방식의 변화를 읽는 역할을 하게 된다.</li>
      </ul>
    </div>
  </div>`;
}

function createBriefingText({ project = "건축 프로젝트", keywords = [], newsItems = [] } = {}) {
  const items = newsItems.length ? newsItems : getFallbackNews(keywords);
  const newsText = items.map((n, i) => `${i + 1}. [${n.category}] ${n.title}\n- ${n.summary}\n- 기사 원문: ${n.url}`).join("\n\n");
  return `Urban Brief AI | 오늘의 건축 시사 브리핑

현재 프로젝트: ${project}
적용된 관심 키워드: ${Array.isArray(keywords) ? keywords.join(", ") : ""}

1. 오늘의 주요 뉴스
${newsText}

2. 오늘의 공통 흐름
오늘의 뉴스들은 사용자가 입력한 관심 키워드를 중심으로 수집되었다.

3. 건축 분야에 미칠 종합 영향
- 관심 키워드는 설계 리서치의 필터가 된다.
- 정책·사회·경제 뉴스는 건축 프로그램과 도시 맥락의 근거로 전환될 수 있다.`;
}

module.exports = {
  defaultKeywords,
  fetchNaverNews,
  getFallbackNews,
  createBriefingHtml,
  createBriefingText,
  stripHtml
};
