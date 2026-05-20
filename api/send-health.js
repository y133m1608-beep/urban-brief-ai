module.exports = async function handler(req, res) {
  res.status(200).json({
    ok: true,
    env: {
      hasResend: Boolean(process.env.RESEND_API_KEY),
      hasRecipient: Boolean(process.env.RECIPIENT_EMAIL),
      hasNaverClientId: Boolean(process.env.NAVER_CLIENT_ID),
      hasNaverClientSecret: Boolean(process.env.NAVER_CLIENT_SECRET),
      hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
      hasGNews: Boolean(process.env.GNEWS_API_KEY),
      fromEmail: process.env.FROM_EMAIL || "Urban Brief AI <onboarding@resend.dev>"
    },
    now: new Date().toISOString()
  });
};
