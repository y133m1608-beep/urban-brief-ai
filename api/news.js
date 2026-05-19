
const { fetchNaverNews } = require("./briefing");

module.exports = async function handler(req, res) {
  try {
    const rawCategories = String(req.query.categories || "");
    let categories = null;

    if (rawCategories) {
      categories = JSON.parse(decodeURIComponent(rawCategories));
    }

    const rawKeywords = String(req.query.keywords || "");
    const keywords = rawKeywords
      ? rawKeywords.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const refresh = String(req.query.refresh || Date.now());

    const newsItems = await fetchNaverNews({ keywords, categories, display: 7, refresh });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json({ ok: true, newsItems, appliedKeywords: keywords, appliedCategories: categories, updatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "뉴스를 불러오지 못했습니다." });
  }
};
