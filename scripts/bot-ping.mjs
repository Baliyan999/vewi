#!/usr/bin/env node
/**
 * Smoke test: reads TELEGRAM_BOT_TOKEN + TELEGRAM_LEAD_CHAT_ID from
 * .env.local and sends a hello message. Confirms both creds are correct
 * end-to-end without exposing the token via the shell.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = await readFile(resolve(__dirname, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  raw
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const [k, ...rest] = l.split("=");
      return [k.trim(), rest.join("=").trim()];
    }),
);

const token = env.TELEGRAM_BOT_TOKEN;
const chatId = env.TELEGRAM_LEAD_CHAT_ID;
if (!token || !chatId) {
  console.error("✗ TELEGRAM_BOT_TOKEN or TELEGRAM_LEAD_CHAT_ID missing");
  process.exit(1);
}

const text = [
  "🤖 <b>Тестовое сообщение от VEWI</b>",
  "",
  "Если ты видишь это — токен и chat_id настроены корректно.",
  "Лиды с лендинга теперь будут приходить сюда.",
  "",
  `<i>Отправлено ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })} (Tashkent)</i>`,
].join("\n");

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  }),
});
const json = await res.json();
if (!json.ok) {
  console.error("✗ send failed:", json.description);
  process.exit(1);
}
console.log("✓ Telegram ping delivered to chat", chatId);
