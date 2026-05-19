
const defaultCategories = [
  { name: "정책 / 제도", keywords: ["주거정책", "도시계획"] },
  { name: "경제 / 부동산", keywords: ["부동산시장", "지역상권"] },
  { name: "사회 / 인구", keywords: ["고령화", "1인가구"] },
  { name: "도시 / 지역", keywords: ["도시재생", "교통인프라"] },
  { name: "환경 / 기후", keywords: ["기후위기", "재난대응"] },
  { name: "기술 / 산업", keywords: ["AI", "도심물류"] },
  { name: "문화 / 생활", keywords: ["관광", "소비트렌드"] }
];

const defaultKeywords = defaultCategories.flatMap((category) => category.keywords);

const defaultArchitectureKeywords = [
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

const architectureWords = [
  "건축", "도시", "공간", "주거", "상업", "상권", "시장", "개발", "재생",
  "정비", "보행", "도로", "공원", "시설", "인프라", "물류", "기후", "환경",
  "계획", "설계", "재개발", "재건축", "복합", "건물", "건설", "도심", "정책",
  "교통", "관광", "인구", "고령", "부동산", "재난", "AI", "기술"
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

function normalizeNaverItem(item, categoryName, keyword, query) {
  return {
    category: categoryName,
    keyword,
    title: stripHtml(item.title),
    summary: stripHtml(item.description),
    url: item.originallink || item.link,
    naverUrl: item.link,
    publishedAt: item.pubDate || "",
    tags: [categoryName, keyword, "건축해석"].filter(Boolean).slice(0, 3),
    query
  };
}

function isRelevant(item, keyword) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const normalizedKeyword = String(keyword || "").toLowerCase();
  if (normalizedKeyword && text.includes(normalizedKeyword)) return true;
  return architectureWords.some((word) => text.includes(word.toLowerCase()));
}

function categoriesFromKeywords(keywords = []) {
  if (!Array.isArray(keywords) || !keywords.length) return defaultCategories;

  const mapped = defaultCategories.map((category) => ({
    ...category,
    keywords: category.keywords.filter((keyword) => keywords.includes(keyword))
  })).filter((category) => category.keywords.length);

  return mapped.length ? mapped : defaultCategories;
}

function createCategoryQueries(category) {
  const keywords = Array.isArray(category.keywords) && category.keywords.length
    ? category.keywords.map((item) => String(item || "").trim()).filter(Boolean)
    : ["도시", "사회"];

  const keywordText = keywords.join(" OR ");

  return {
    categoryName: category.name,
    keywords,
    queries: [
      `${keywordText} 도시 공간`,
      `${keywordText} 정책 사회`,
      `${keywordText} 건축 도시`
    ]
  };
}

async function fetchArticlesForCategory({ category, limit = 5, refresh = "" } = {}) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const { categoryName, keywords, queries } = createCategoryQueries(category);
  const results = [];
  const seen = new Set();

  for (const query of queries) {
    const url = new URL("https://openapi.naver.com/v1/search/news.json");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "10");
    url.searchParams.set("start", "1");
    url.searchParams.set("sort", "date");
    if (refresh) url.searchParams.set("_refresh", refresh);

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
        const title = stripHtml(item.title).toLowerCase();
        const summary = stripHtml(item.description).toLowerCase();
        const matchedKeyword =
          keywords.find((keyword) => `${title} ${summary}`.includes(keyword.toLowerCase())) || keywords[0];

        const normalized = normalizeNaverItem(item, categoryName, matchedKeyword, query);
        const key = normalized.url || normalized.title;
        if (!key || seen.has(key)) continue;
        if (!isRelevant(normalized, matchedKeyword)) continue;

        seen.add(key);
        results.push(normalized);
        if (results.length >= limit) return results;
      }
    } catch (error) {
      continue;
    }
  }

  return results;
}

async function fetchNewsByCategory({ categories = defaultCategories, perCategory = 5, refresh = "" } = {}) {
  const selected = Array.isArray(categories) && categories.length ? categories : defaultCategories;
  const grouped = [];

  for (const category of selected.slice(0, 7)) {
    const articles = await fetchArticlesForCategory({ category, limit: perCategory, refresh });
    grouped.push({
      category: category.name,
      keywords: category.keywords || [],
      representative: articles[0] || getFallbackArticle(category),
      articles: articles.length ? articles : [getFallbackArticle(category)]
    });
  }

  return grouped;
}

async function fetchNaverNews({ keywords = [], categories = null, display = 7, refresh = "" } = {}) {
  const selectedCategories = categories && categories.length ? categories : categoriesFromKeywords(keywords);
  const grouped = await fetchNewsByCategory({ categories: selectedCategories, perCategory: 5, refresh });
  return grouped.map((group) => group.representative).filter(Boolean).slice(0, display);
}

function getFallbackArticle(category) {
  return {
    category: category.name,
    keyword: category.keywords?.[0] || category.name,
    title: `${category.name} 분야 최신 뉴스가 부족하여 기본 브리핑 항목을 표시합니다`,
    summary: "현재 분야와 정확히 맞는 최신 뉴스가 부족합니다. 키워드를 더 넓게 조정하거나, 네이버 뉴스 API 환경변수를 확인하세요.",
    url: "https://news.naver.com/",
    publishedAt: "",
    tags: [category.name, category.keywords?.[0] || "뉴스", "건축해석"].filter(Boolean)
  };
}

function getFallbackNews({ categories = defaultCategories } = {}) {
  const selected = Array.isArray(categories) && categories.length ? categories : defaultCategories;
  return selected.slice(0, 7).map((category) => getFallbackArticle(category));
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function createBriefingHtml({ project = "건축 시사 브리핑", keywords = [], categories = null, newsItems = [] } = {}) {
  const selectedCategories = categories && categories.length ? categories : categoriesFromKeywords(keywords);
  const keywordText = selectedCategories.flatMap((category) => category.keywords || []).join(", ");
  const items = newsItems.length ? newsItems : getFallbackNews({ categories: selectedCategories });

  const newsHtml = items.map((news, index) => `
    <tr>
      <td style="padding:18px 0;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 6px;color:#64748b;font-size:13px;font-weight:700;">${index + 1}. ${news.category}${news.keyword ? " · " + news.keyword : ""}${formatDate(news.publishedAt) ? " · " + formatDate(news.publishedAt) : ""}</p>
        <h3 style="margin:0 0 8px;font-size:18px;color:#111827;">${news.title}</h3>
        <p style="margin:0 0 10px;color:#374151;line-height:1.65;font-size:14px;">${news.summary}</p>
        <a href="${news.url}" target="_blank" style="color:#111827;font-weight:700;">기사 원문 열기 ↗</a>
      </td>
    </tr>
  `).join("");

  const architectureKeywordHtml = defaultArchitectureKeywords
    .map((keyword) => `<span style="display:inline-block;margin:4px;padding:7px 10px;border-radius:999px;background:#111827;color:#fff;font-size:12px;font-weight:700;">${keyword}</span>`)
    .join("");

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;padding:32px;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:14px;font-weight:700;">Urban Brief AI</p>
      <h1 style="margin:0 0 18px;color:#111827;font-size:30px;letter-spacing:-0.04em;">오늘의 건축 시사 브리핑</h1>
      <p style="margin:0 0 20px;color:#374151;line-height:1.7;">
        현재 프로젝트: <strong>${project}</strong><br/>
        적용된 뉴스 키워드: ${keywordText}
      </p>
      <h2 style="margin:28px 0 6px;color:#111827;font-size:22px;">1. 오늘의 주요 뉴스</h2>
      <table style="width:100%;border-collapse:collapse;">${newsHtml}</table>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">2. 오늘의 공통 흐름</h2>
      <p style="margin:0;color:#374151;line-height:1.75;">
        오늘의 뉴스는 정책, 경제, 사회, 도시, 환경, 기술, 문화 흐름을 균형 있게 읽기 위해 분야별로 수집되었다.
        건축은 이 변화들을 단순한 사건이 아니라 주거, 공공공간, 인프라, 상업공간, 생활 방식의 변화로 번역해야 한다.
      </p>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">3. 건축 분야에 미칠 종합 영향</h2>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;">
        <li>건축은 사회 전반의 흐름을 읽고, 이를 공간 프로그램과 도시 구조의 변화로 해석하는 역할을 요구받는다.</li>
        <li>정책·경제·인구·기후·기술 이슈는 건축의 규모, 용도, 운영 방식, 공공성에 직접적인 영향을 준다.</li>
        <li>건축 에이전트는 뉴스 자체보다 여러 뉴스가 함께 만들어내는 공간적 요구를 파악하는 데 목적이 있다.</li>
      </ul>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">4. 오늘의 건축 키워드</h2>
      <div>${architectureKeywordHtml}</div>
    </div>
  </div>`;
}

function createBriefingText({ project = "건축 시사 브리핑", keywords = [], categories = null, newsItems = [] } = {}) {
  const selectedCategories = categories && categories.length ? categories : categoriesFromKeywords(keywords);
  const items = newsItems.length ? newsItems : getFallbackNews({ categories: selectedCategories });
  const newsText = items.map((n, i) => `${i + 1}. [${n.category}] ${n.title}\n- ${n.summary}\n- 기사 원문: ${n.url}`).join("\n\n");
  return `Urban Brief AI | 오늘의 건축 시사 브리핑

현재 프로젝트: ${project}

1. 오늘의 주요 뉴스
${newsText}

2. 오늘의 공통 흐름
오늘의 뉴스는 정책, 경제, 사회, 도시, 환경, 기술, 문화 흐름을 균형 있게 읽기 위해 분야별로 수집되었다.

3. 건축 분야에 미칠 종합 영향
- 건축은 사회 전반의 흐름을 공간 프로그램과 도시 구조의 변화로 해석해야 한다.

4. 오늘의 건축 키워드
${defaultArchitectureKeywords.join(", ")}`;
}

module.exports = {
  defaultCategories,
  defaultKeywords,
  defaultArchitectureKeywords,
  fetchNaverNews,
  fetchNewsByCategory,
  getFallbackNews,
  createBriefingHtml,
  createBriefingText,
  stripHtml
};
