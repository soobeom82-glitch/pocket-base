const TELEGRAM_API_BASE = "https://api.telegram.org";
const DEFAULT_TELEGRAM_CHAT_ID = "2024532580";

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const rawBody = Buffer.concat(chunks).toString("utf8");
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function buildVisitMessage(payload) {
  const lines = [
    "Pocket Base 방문 알림",
    "",
    `방문 시각: ${payload.visitedAt || "-"}`,
    `페이지: ${payload.path || "-"}`,
    `URL: ${payload.url || "-"}`,
    `유입 경로: ${payload.referrer || "-"}`,
    `브라우저: ${payload.userAgent || "-"}`,
    `언어: ${payload.language || "-"}`,
    `화면 크기: ${payload.screen || "-"}`,
    `뷰포트: ${payload.viewport || "-"}`,
  ];

  return lines.join("\n");
}

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_TELEGRAM_CHAT_ID;

  if (!botToken) {
    res.status(500).json({
      ok: false,
      message: "Missing TELEGRAM_BOT_TOKEN environment variable",
    });
    return;
  }

  readJsonBody(req)
    .then((payload) =>
      fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildVisitMessage(payload),
        }),
      }).then((telegramResponse) =>
        telegramResponse.json().then((telegramPayload) => ({
          ok: telegramResponse.ok,
          telegramPayload,
        }))
      )
    )
    .then((state) => {
      if (!state.ok || !state.telegramPayload.ok) {
        throw new Error("Failed to send Telegram message");
      }

      res.status(200).json({ ok: true });
    })
    .catch(() => {
      res.status(500).json({
        ok: false,
        message: "Telegram delivery failed",
      });
    });
};
