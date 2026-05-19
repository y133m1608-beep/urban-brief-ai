
const defaultQueries = [
  "도시 개발 정책",
  "주거 정책 도시",
  "도심 물류",
  "기후위기 도시 폭염",
  "지역 상권 도시재생"
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

function normalizeNaverItem(item, query) {
  return {
    category: query,
    title: stripHtml(item.title),
    summary: stripHtml(item.description),
    url: item.originallink || item.link,
    naverUrl: item.link,
    publishedAt: item.pubDate || "",
    tags: query.split(" ").filter(Boolean).slice(0, 3)
  };
}

async function fetchNaverNews({ keywords = [], display = 5 } = {}) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return getFallbackNews();
  }

  const queries = Array.isArray(keywords) && keywords.length
    ? keywords.slice(0, 5)
    : defaultQueries;

  const results = [];
  const seen = new Set();

  for (const query of queries) {
    const url = new URL("https://openapi.naver.com/v1/search/news.json");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "3");
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
        const normalized = normalizeNaverItem(item, query);
        const key = normalized.url || normalized.title;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        results.push(normalized);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  return results.length ? results.slice(0, display) : getFallbackNews();
}

function getFallbackNews() {
  return [
    {
      category: "정책 / 도시",
      title: "도심 노후 상업지 정비 지원 확대 논의",
      summary: "노후 상업지와 기존 상권을 대상으로 환경 개선, 보행환경 정비, 지역상권 활성화를 지원하는 정책이 논의되고 있다.",
      url: "https://news.naver.com/",
      publishedAt: "",
      tags: ["노후상가", "도시재생", "보행환경"]
    },
    {
      category: "사회",
      title: "고령 인구 증가에 따른 생활권 돌봄 인프라 확충 필요성 증가",
      summary: "고령화가 심화되면서 주거지 가까운 곳에서 이용 가능한 생활권 복지·돌봄 시설의 필요성이 커지고 있다.",
      url: "https://news.naver.com/",
      publishedAt: "",
      tags: ["고령화", "생활권", "돌봄"]
    },
    {
      category: "경제 / 물류",
      title: "온라인 소비 증가로 도심형 물류 거점 수요 확대",
      summary: "소비 방식이 온라인 중심으로 이동하면서 도심 안에서 보관, 분류, 배송을 처리할 수 있는 소규모 물류 거점의 중요성이 높아지고 있다.",
      url: "https://news.naver.com/",
      publishedAt: "",
      tags: ["도심물류", "라스트마일", "상업공간"]
    },
    {
      category: "환경",
      title: "폭염 대응을 위한 도시 그늘, 쉼터, 보행환경 개선 요구 확대",
      summary: "기후위기로 인한 폭염과 집중호우가 반복되면서 보행자를 보호하는 그늘, 캐노피, 반외부공간, 공공 쉼터의 필요성이 커지고 있다.",
      url: "https://news.naver.com/",
      publishedAt: "",
      tags: ["기후대응", "반외부공간", "공공공간"]
    },
    {
      category: "문화 / 지역",
      title: "지역 상권과 관광을 연결하는 로컬 경험형 공간 주목",
      summary: "단순 소비보다 지역의 생활문화와 상품을 직접 경험할 수 있는 상업공간에 대한 관심이 높아지고 있다.",
      url: "https://news.naver.com/",
      publishedAt: "",
      tags: ["로컬경험", "상업공간", "관광"]
    }
  ];
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function createBriefingHtml({ project = "건축 프로젝트", keywords = [], newsItems = [] } = {}) {
  const keywordText = Array.isArray(keywords) && keywords.length ? keywords.join(", ") : "도시재생, 건축, 사회 이슈";
  const items = newsItems.length ? newsItems : getFallbackNews();

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
        관심 키워드: ${keywordText}
      </p>
      <h2 style="margin:28px 0 6px;color:#111827;font-size:22px;">1. 오늘의 주요 뉴스</h2>
      <table style="width:100%;border-collapse:collapse;">${newsHtml}</table>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">2. 오늘의 공통 흐름</h2>
      <p style="margin:0;color:#374151;line-height:1.75;">
        오늘의 뉴스들은 공통적으로 기존 도시공간을 단순히 새로 개발하는 것이 아니라,
        생활 인프라로 다시 조직하려는 흐름을 보여준다. 정책, 사회, 경제, 환경 이슈는 서로 다른 뉴스처럼 보이지만,
        모두 기존 도시조직 안에서 새로운 기능을 수용하고 연결하는 문제로 이어진다.
      </p>
      <h2 style="margin:32px 0 10px;color:#111827;font-size:22px;">3. 건축 분야에 미칠 종합 영향</h2>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;">
        <li>기존 건축물과 도시조직을 철거하기보다, 새로운 프로그램을 삽입하고 재구성하는 리노베이션 전략이 중요해진다.</li>
        <li>주거, 상업, 물류, 돌봄, 공공공간이 하나의 생활권 안에서 복합적으로 결합될 가능성이 커진다.</li>
        <li>기후 변화에 대응하기 위해 그늘, 캐노피, 중정, 공중가로, 테라스 같은 반외부공간이 도시 인프라로 다뤄질 수 있다.</li>
        <li>건축가는 형태를 만드는 역할을 넘어 사회적 변화와 공간 프로그램 사이의 관계를 조직하는 역할을 요구받게 된다.</li>
      </ul>
      <div style="margin-top:30px;background:#f1f5f9;border-radius:18px;padding:20px;">
        <p style="margin:0 0 8px;color:#111827;font-weight:800;">오늘의 건축적 질문</p>
        <p style="margin:0;color:#374151;line-height:1.75;">
          앞으로 건축은 새로운 형태를 만드는 것보다, 기존 도시 안에서 주거·상업·물류·돌봄·기후 대응 기능을 어떻게 함께 조직할 것인가?
        </p>
      </div>
    </div>
  </div>`;
}

function createBriefingText({ project = "건축 프로젝트", keywords = [], newsItems = [] } = {}) {
  const items = newsItems.length ? newsItems : getFallbackNews();
  const newsText = items.map((n, i) => `${i + 1}. [${n.category}] ${n.title}\n- ${n.summary}\n- 기사 원문: ${n.url}`).join("\n\n");
  return `Urban Brief AI | 오늘의 건축 시사 브리핑

현재 프로젝트: ${project}
관심 키워드: ${Array.isArray(keywords) ? keywords.join(", ") : ""}

1. 오늘의 주요 뉴스
${newsText}

2. 오늘의 공통 흐름
오늘의 뉴스들은 공통적으로 기존 도시공간을 단순히 새로 개발하는 것이 아니라, 생활 인프라로 다시 조직하려는 흐름을 보여준다.

3. 건축 분야에 미칠 종합 영향
- 기존 건축물과 도시조직을 철거하기보다 새로운 프로그램을 삽입하고 재구성하는 전략이 중요해진다.
- 복합 프로그램과 생활권 단위의 공공 인프라가 중요해진다.
- 반외부공간과 기후 대응형 보행환경이 도시 인프라로 다뤄질 수 있다.`;
}

module.exports = {
  defaultQueries,
  fetchNaverNews,
  getFallbackNews,
  createBriefingHtml,
  createBriefingText,
  stripHtml
};
