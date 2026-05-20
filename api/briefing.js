
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
  "교통", "관광", "인구", "고령", "부동산", "재난", "AI", "기술", "국제", "해외", "글로벌", "스마트시티", "국제분쟁", "에너지", "미국", "정치", "세계경제", "지정학", "에너지", "공급망", "메가시티"
];


function normalizeDuplicateKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/https?:\/\/(www\.)?/g, "")
    .replace(/[?#].*$/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

function getArticleDuplicateKeys(article = {}) {
  const urlKey = normalizeDuplicateKey(article.url || article.naverUrl || "");
  const titleKey = normalizeDuplicateKey(article.title || "");
  return [urlKey, titleKey].filter(Boolean);
}

function isDuplicateArticle(article = {}, globalSeen = new Set()) {
  const keys = getArticleDuplicateKeys(article);
  return keys.some((key) => globalSeen.has(key));
}

function rememberArticle(article = {}, globalSeen = new Set()) {
  const keys = getArticleDuplicateKeys(article);
  keys.forEach((key) => globalSeen.add(key));
}

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


function normalizeGNewsItem(item, categoryName = "국제 / 정세", keyword = "세계정세") {
  return {
    category: categoryName,
    keyword,
    title: stripHtml(item.title || ""),
    summary: stripHtml(item.description || item.content || ""),
    url: item.url,
    naverUrl: item.url,
    publishedAt: item.publishedAt || "",
    tags: [categoryName, keyword, "해외뉴스"].filter(Boolean).slice(0, 3),
    query: keyword,
    source: item.source?.name || "Global News"
  };
}

async function fetchGNewsForWorldAffairs({ category, limit = 5, refresh = "" } = {}) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const categoryName = category?.name || "국제 / 정세";
  const keyword = "세계정세";
  const query = encodeURIComponent('(geopolitics OR "global economy" OR energy OR "supply chain" OR "climate diplomacy" OR election OR conflict)');
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${Math.min(Math.max(limit, 1), 10)}&apikey=${apiKey}${refresh ? `&t=${refresh}` : ""}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];
    return articles
      .map((item) => normalizeGNewsItem(item, categoryName, keyword))
      .filter((item) => item.title && item.url)
      .slice(0, limit);
  } catch (error) {
    return [];
  }
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
  const globalSeen = new Set();

  for (const category of selected.slice(0, 8)) {
    let rawArticles = [];

    if (category.name === "국제 / 정세") {
      rawArticles = await fetchGNewsForWorldAffairs({ category, limit: perCategory + 8, refresh });
    }

    if (!rawArticles.length) {
      rawArticles = await fetchArticlesForCategory({ category, limit: perCategory + 8, refresh });
    }

    const uniqueArticles = [];
    for (const article of rawArticles) {
      if (isDuplicateArticle(article, globalSeen)) continue;
      rememberArticle(article, globalSeen);
      uniqueArticles.push(article);
      if (uniqueArticles.length >= perCategory) break;
    }

    const fallback = getFallbackArticle(category);
    const representative = uniqueArticles[0] || fallback;

    if (!uniqueArticles.length && !isDuplicateArticle(fallback, globalSeen)) {
      rememberArticle(fallback, globalSeen);
    }

    grouped.push({
      category: category.name,
      keywords: category.keywords || [],
      representative,
      articles: uniqueArticles.length ? uniqueArticles : [fallback]
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
  return selected.slice(0, 8).map((category) => getFallbackArticle(category));
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


function createFallbackQuestion(newsItems = []) {
  const text = newsItems.map((item) => `${item.category} ${item.keyword || ""} ${item.title} ${item.summary}`).join(" ");

  if (text.includes("기후") || text.includes("폭염") || text.includes("재난") || text.includes("침수")) {
    return "기후위기와 재난 대응이 일상화되는 상황에서 건축은 외부공간과 생활 인프라를 어떻게 기후 대응 장치로 전환할 수 있을까?";
  }

  if (text.includes("고령") || text.includes("1인가구") || text.includes("인구") || text.includes("돌봄")) {
    return "인구구조가 변화하는 상황에서 주거와 공공공간은 개인화된 삶과 공동체적 돌봄을 어떻게 함께 수용해야 할까?";
  }

  if (text.includes("상권") || text.includes("소비") || text.includes("관광") || text.includes("시장")) {
    return "소비와 지역상권의 변화 속에서 상업공간은 판매를 넘어 체류, 경험, 지역성을 어떻게 담아야 할까?";
  }

  if (text.includes("AI") || text.includes("기술", "국제", "해외", "글로벌", "스마트시티", "국제분쟁", "에너지", "미국", "정치", "세계경제", "지정학", "에너지", "공급망", "메가시티") || text.includes("물류")) {
    return "기술과 산업 구조가 바뀌는 상황에서 건축은 보이지 않는 데이터·물류·운영 시스템을 어떤 공간 구조로 드러낼 수 있을까?";
  }

  return "정책, 경제, 사회, 도시, 환경, 기술, 문화 변화는 앞으로 어떤 공간 프로그램과 도시 구조를 요구하게 될까?";
}

async function generateArchitecturalQuestion({ newsItems = [] } = {}) {
  const fallback = createFallbackQuestion(newsItems);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const compactNews = newsItems.slice(0, 8).map((item, index) => ({
      index: index + 1,
      category: item.category,
      keyword: item.keyword,
      title: item.title,
      summary: item.summary
    }));

    const prompt = `
너는 건축 시사 브리핑 에이전트다.
아래 오늘의 뉴스들을 종합해서, 건축가/건축학과 학생이 생각해볼 만한 "오늘의 건축적 질문"을 한국어 한 문장으로 만들어라.

조건:
- 뉴스 하나가 아니라 전체 흐름을 종합할 것
- 건축, 도시공간, 프로그램, 생활 방식, 공공성 중 하나 이상과 연결할 것
- 질문형 문장으로 끝낼 것
- 70자 이상 150자 이하
- 따옴표 없이 질문만 출력할 것

뉴스:
${JSON.stringify(compactNews, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const outputText =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output.flatMap((part) => part.content || []).map((content) => content.text || "").join("")
        : "");

    const question = String(outputText || "").trim();
    return question || fallback;
  } catch (error) {
    return fallback;
  }
}



function createFallbackImpacts(newsItems = []) {
  const text = newsItems.map((item) => `${item.category} ${item.keyword || ""} ${item.title} ${item.summary}`).join(" ");

  if (text.includes("기후") || text.includes("폭염") || text.includes("재난") || text.includes("침수")) {
    return [
      "오늘 뉴스는 기후위기와 재난 대응이 건축의 부가 조건이 아니라 기본 성능이 되고 있음을 보여준다.",
      "건축은 실내 공간만이 아니라 그늘, 배수, 피난, 냉방, 반외부공간을 포함한 생활 안전 인프라로 계획될 필요가 있다.",
      "공공공간과 보행환경은 미관 중심의 외부공간이 아니라 폭염·침수·재난 상황에서 일상을 유지하게 하는 도시 장치로 다뤄져야 한다.",
      "향후 설계에서는 에너지 효율뿐 아니라 기후 리스크를 흡수하는 공간 구조와 운영 방식이 함께 요구될 가능성이 크다."
    ];
  }

  if (text.includes("고령") || text.includes("1인가구") || text.includes("저출산") || text.includes("인구") || text.includes("돌봄")) {
    return [
      "오늘 뉴스는 인구구조 변화가 주거 유형과 생활 인프라의 재편을 요구하고 있음을 보여준다.",
      "건축은 가족 단위 중심의 표준 주거에서 벗어나 1인가구, 고령자, 돌봄 수요를 수용하는 다양한 주거 모델을 고민해야 한다.",
      "주거와 복지시설은 분리된 프로그램이 아니라 생활권 안에서 연결되는 작은 공공 인프라로 배치될 필요가 있다.",
      "앞으로 건축의 공공성은 큰 시설을 새로 짓는 방식보다 일상 공간 가까이에 돌봄, 휴식, 교류 기능을 삽입하는 방식으로 강화될 수 있다."
    ];
  }

  if (text.includes("상권") || text.includes("시장") || text.includes("소비") || text.includes("관광") || text.includes("지역")) {
    return [
      "오늘 뉴스는 지역상권과 소비 방식의 변화가 상업공간의 역할을 다시 정의하고 있음을 보여준다.",
      "상업공간은 단순 판매 장소가 아니라 체험, 물류, 체류, 지역 정체성이 결합된 복합 프로그램으로 변화할 가능성이 크다.",
      "전통시장과 노후 상가는 철거 대상이 아니라 기존 상품 흐름과 생활 문화를 재조직할 수 있는 도시 자산으로 해석될 수 있다.",
      "건축은 지역의 경제 활동을 수용하는 동시에 방문자와 거주자 모두가 머무를 수 있는 공공적 장면을 만들어야 한다."
    ];
  }

  if (text.includes("AI") || text.includes("기술", "국제", "해외", "글로벌", "스마트시티", "국제분쟁", "에너지", "미국", "정치", "세계경제", "지정학", "에너지", "공급망", "메가시티") || text.includes("물류") || text.includes("산업")) {
    return [
      "오늘 뉴스는 기술과 산업 구조의 변화가 건축의 운영 방식과 공간 구성에 직접 영향을 주고 있음을 보여준다.",
      "AI, 물류, 자동화 기술은 보이지 않는 시스템이지만, 건축에서는 동선, 저장, 관리, 서비스 공간의 재편으로 나타날 수 있다.",
      "도시 안의 건축은 사람의 이용뿐 아니라 데이터, 물류, 유지관리 시스템이 함께 작동하는 플랫폼으로 이해될 필요가 있다.",
      "앞으로 설계에서는 고정된 공간보다 변화하는 기술과 운영 방식에 대응할 수 있는 가변적 공간 구조가 중요해질 수 있다."
    ];
  }

  return [
    "오늘 뉴스는 사회 전반의 변화가 건축의 프로그램과 도시 구조에 영향을 미치고 있음을 보여준다.",
    "건축은 개별 건물의 형태보다 정책, 경제, 사회, 환경 변화가 만들어내는 공간적 요구를 읽는 역할을 해야 한다.",
    "주거, 상업, 공공공간, 인프라는 더 이상 분리된 프로그램이 아니라 하나의 생활권 안에서 복합적으로 연결될 가능성이 크다.",
    "앞으로 건축은 새로운 공간을 만드는 것뿐 아니라 기존 도시 안의 기능들을 어떻게 재조직할 것인지가 중요해질 수 있다."
  ];
}

async function generateArchitecturalImpacts({ newsItems = [] } = {}) {
  const fallback = createFallbackImpacts(newsItems);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const compactNews = newsItems.slice(0, 8).map((item, index) => ({
      index: index + 1,
      category: item.category,
      keyword: item.keyword,
      title: item.title,
      summary: item.summary
    }));

    const prompt = `
너는 건축 시사 브리핑 에이전트다.
아래 오늘의 뉴스들을 종합해서 "건축 분야에 미칠 종합 영향"을 한국어로 4개 작성하라.

조건:
- 일반론 금지. 오늘 뉴스의 구체적 흐름을 반영할 것.
- 뉴스 하나씩 분석하지 말고 전체 흐름을 종합할 것.
- 각 항목은 건축, 도시공간, 주거, 공공공간, 상업공간, 인프라, 프로그램 중 하나 이상과 연결할 것.
- 각 항목은 1문장으로 작성할 것.
- 결과는 JSON 배열만 출력할 것. 예: ["문장1", "문장2", "문장3", "문장4"]

뉴스:
${JSON.stringify(compactNews, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const outputText =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output.flatMap((part) => part.content || []).map((content) => content.text || "").join("")
        : "");

    const cleaned = String(outputText || "").trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length) {
      return parsed.slice(0, 4).map((item) => String(item).trim()).filter(Boolean);
    }

    return fallback;
  } catch (error) {
    return fallback;
  }
}


function createFallbackCommonFlow(newsItems = []) {
  const text = newsItems.map((item) => `${item.category} ${item.keyword || ""} ${item.title} ${item.summary}`).join(" ");

  if (text.includes("기후") || text.includes("폭염") || text.includes("재난") || text.includes("침수")) {
    return "오늘의 뉴스들은 기후위기와 재난 대응이 더 이상 환경 분야에만 머무르지 않고, 주거·공공공간·도시 인프라 전반의 기본 조건으로 확장되고 있음을 보여준다.";
  }

  if (text.includes("고령") || text.includes("1인가구") || text.includes("저출산") || text.includes("인구") || text.includes("돌봄")) {
    return "오늘의 뉴스들은 인구구조 변화가 단순한 사회 문제가 아니라, 주거 유형·생활권 시설·돌봄 인프라를 다시 구성해야 하는 공간적 문제로 이어지고 있음을 보여준다.";
  }

  if (text.includes("상권") || text.includes("시장") || text.includes("소비") || text.includes("관광") || text.includes("지역")) {
    return "오늘의 뉴스들은 지역상권과 소비 방식의 변화가 판매 중심 공간을 넘어, 체류·경험·물류·관광이 결합된 복합적인 도시공간을 요구하고 있음을 보여준다.";
  }

  if (text.includes("AI") || text.includes("기술", "국제", "해외", "글로벌", "스마트시티", "국제분쟁", "에너지", "미국", "정치", "세계경제", "지정학", "에너지", "공급망", "메가시티") || text.includes("물류") || text.includes("산업")) {
    return "오늘의 뉴스들은 기술과 산업 구조의 변화가 도시의 보이지 않는 운영 시스템을 바꾸고 있으며, 이는 건축에서 동선·저장·서비스·관리 공간의 재편으로 나타날 수 있음을 보여준다.";
  }

  return "오늘의 뉴스들은 서로 다른 분야의 사건처럼 보이지만, 공통적으로 도시 안에서 주거·상업·공공공간·인프라가 더 복합적으로 연결되어야 하는 흐름을 보여준다.";
}

async function generateCommonFlow({ newsItems = [] } = {}) {
  const fallback = createFallbackCommonFlow(newsItems);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const compactNews = newsItems.slice(0, 8).map((item, index) => ({
      index: index + 1,
      category: item.category,
      keyword: item.keyword,
      title: item.title,
      summary: item.summary
    }));

    const prompt = `
너는 건축 시사 브리핑 에이전트다.
아래 오늘의 뉴스들을 종합해서 "오늘의 공통 흐름"을 한국어 문단 1개로 작성하라.

조건:
- 일반론 금지. 오늘 뉴스들의 실제 흐름을 반영할 것.
- 뉴스 하나씩 나열하지 말고 전체를 관통하는 공통 흐름만 쓸 것.
- 건축, 도시공간, 생활 인프라, 공공공간, 주거, 상업공간 중 하나 이상과 연결할 것.
- 2문장 이내, 120자 이상 260자 이하.
- 따옴표 없이 문단만 출력할 것.

뉴스:
${JSON.stringify(compactNews, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const outputText =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output.flatMap((part) => part.content || []).map((content) => content.text || "").join("")
        : "");

    const commonFlow = String(outputText || "").trim();
    return commonFlow || fallback;
  } catch (error) {
    return fallback;
  }
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
  stripHtml,
  createFallbackQuestion,
  generateArchitecturalQuestion,
  createFallbackImpacts,
  generateArchitecturalImpacts,
  createFallbackCommonFlow,
  generateCommonFlow,
  fetchGNewsForWorldAffairs
};
