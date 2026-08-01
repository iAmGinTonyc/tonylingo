import { createHmac } from "crypto";

// Thin wrapper around the Telegram Bot API — plain fetch, no SDK needed.
const API_BASE = "https://api.telegram.org/bot";

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return t;
}

function appUrl() {
  const u = process.env.APP_URL;
  if (!u) throw new Error("APP_URL is not set");
  return u.replace(/\/$/, "");
}

async function call(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API ${method} failed: ${data.description}`);
  return data.result;
}

export async function sendOpenAppMessage(chatId: string, text: string, deepLinkTextId?: string) {
  const url = deepLinkTextId ? `${appUrl()}/?text=${deepLinkTextId}` : appUrl();
  return call("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [[{ text: "Открыть TonyLingo", web_app: { url } }]],
    },
  });
}

export async function setMenuButton() {
  return call("setChatMenuButton", {
    menu_button: { type: "web_app", text: "Открыть", web_app: { url: appUrl() } },
  });
}

export async function setWebhook() {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) throw new Error("TELEGRAM_WEBHOOK_SECRET is not set");
  return call("setWebhook", {
    url: `${appUrl()}/api/telegram/webhook`,
    secret_token: secret,
  });
}

export async function notifyNewText(chatId: string, title: string, textId: string) {
  return sendOpenAppMessage(chatId, `Новый текст готов: «${title}» 📖`, textId);
}

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  username?: string;
};

// Verifies the signed initData string a Telegram Mini App sends on launch.
// See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function verifyTelegramInitData(initData: string): TelegramWebAppUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(token()).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw) as TelegramWebAppUser;
  } catch {
    return null;
  }
}
