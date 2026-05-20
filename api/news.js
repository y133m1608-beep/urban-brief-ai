
const { fetchNewsByCategory, generateArchitecturalQuestion, generateArchitecturalImpacts } = require("./briefing");

module.exports = async function handler(req, res) {
  try {
    const rawCategories = String(req.query.categories || "");
    let categories = null;

    if (rawCategories) {
      categories = JSON.parse(decodeURIComponent(rawCategories));
    }

    const refresh = String(req.query.refresh || Date.now());
    const groupedNews = await fetchNewsByCategory({ categories, perCategory: 5, refresh });
    const newsItems = groupedNews.map((group) => group.representative);
    const question = await generateArchitecturalQuestion({ newsItems });
    const impacts = await generateArchitecturalImpacts({ newsItems });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json({
      ok: true,
      groupedNews,
      newsItems,
      question,
      impacts,
      appliedCategories: categories,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "뉴스를 불러오지 못했습니다." });
  }
};
