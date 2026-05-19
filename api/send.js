
const { Resend } = require("resend");
const { createBriefingHtml, createBriefingText } = require("./briefing");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 가능합니다." });
  }

  try {
    const { email, project, keywords } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "수신 이메일이 필요합니다." });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: "RESEND_API_KEY가 설정되지 않았습니다. Vercel Environment Variables에 API 키를 추가해야 합니다."
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.FROM_EMAIL || "Urban Brief AI <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from,
      to: email,
      subject: "Urban Brief AI | 오늘의 건축 시사 브리핑",
      html: createBriefingHtml({ project, keywords }),
      text: createBriefingText({ project, keywords })
    });

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({
      error: error && error.message ? error.message : "메일 발송 중 오류가 발생했습니다."
    });
  }
};
