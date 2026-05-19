
const { Resend } = require("resend");
const { createBriefingHtml, createBriefingText, fetchNaverNews, defaultKeywords } = require("./briefing");

module.exports = async function handler(req, res) {
  try {
    if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: "RESEND_API_KEY가 설정되지 않았습니다." });
    const recipient = process.env.RECIPIENT_EMAIL;
    if (!recipient) return res.status(500).json({ error: "RECIPIENT_EMAIL이 설정되지 않았습니다." });

    const project = process.env.PROJECT_NAME || "남대문시장 C·D동 리노베이션";
    const keywords = (process.env.KEYWORDS || defaultKeywords.join(","))
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const newsItems = await fetchNaverNews({ keywords, display: 5 });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.FROM_EMAIL || "Urban Brief AI <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from,
      to: recipient,
      subject: "Urban Brief AI | 오늘의 건축 시사 브리핑",
      html: createBriefingHtml({ project, keywords, newsItems }),
      text: createBriefingText({ project, keywords, newsItems })
    });

    return res.status(200).json({ ok: true, message: "scheduled email sent", result, newsItems, appliedKeywords: keywords });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Cron 메일 발송 중 오류가 발생했습니다." });
  }
};
