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

function buildTelegramMessage(payload) {
  const name = payload.name;
  const phone = payload.phone;
  const email = payload.email;
  const message = payload.message;
  const lines = [
    "Pocket Base 상담 신청",
    "",
    `이름: ${name || "-"}`,
    `연락처: ${phone || "-"}`,
    `이메일: ${email || "-"}`,
    "",
    "[문의 내용]",
    message || "-",
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
    .then((body) => {
      const payload = {
        name: String(body.name || "").trim(),
        phone: String(body.phone || "").trim(),
        email: String(body.email || "").trim(),
        message: String(body.message || "").trim(),
      };

      if (!payload.name || !payload.phone || !payload.message) {
        res.status(400).json({ ok: false, message: "Missing required fields" });
        return null;
      }

      return fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildTelegramMessage(payload),
        }),
      }).then((telegramResponse) =>
        telegramResponse.json().then((telegramPayload) => ({
          ok: telegramResponse.ok,
          telegramPayload,
        }))
      );
    })
    .then((state) => {
      if (!state || res.writableEnded) {
        return;
      }

      if (!state.ok || !state.telegramPayload.ok) {
        throw new Error("Failed to send Telegram message");
      }

      res.status(200).json({ ok: true });
    })
    .catch(() => {
      if (!res.writableEnded) {
        res.status(500).json({
          ok: false,
          message: "Telegram delivery failed",
        });
      }
    });
};
