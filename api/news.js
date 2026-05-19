
const { fetchNaverNews } = require("./briefing");

module.exports = async function handler(req, res) {
  try {
    const rawKeywords = String(req.query.keywords || "");
    const keywords = rawKeywords
      ? rawKeywords.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const newsItems = await fetchNaverNews({ keywords, display: 7 });
    res.status(200).json({ ok: true, newsItems, appliedKeywords: keywords, updatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "뉴스를 불러오지 못했습니다." });
  }
};
