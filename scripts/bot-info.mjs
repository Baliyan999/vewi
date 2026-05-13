#!/usr/bin/env node
/**
 * Reads TELEGRAM_BOT_TOKEN from .env.local and prints:
 *   - bot's name + username (from /getMe)
 *   - chat_id of the last person who messaged the bot (from /getUpdates)
 *
 * The token itself never appears on the command line or in stdout, so it
 * stays out of shell history / transcript logs.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

const raw = await readFile(envPath, "utf8");
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
if (!token) {
  console.error("✗ TELEGRAM_BOT_TOKEN missing in .env.local");
  process.exit(1);
}

const api = (m) => `https://api.telegram.org/bot${token}/${m}`;

const me = await fetch(api("getMe")).then((r) => r.json());
if (!me.ok) {
  console.error("✗ getMe failed:", me.description);
  process.exit(1);
}
const b = me.result;
console.log("\nBot identity");
console.log("────────────");
console.log(`  Name:       ${b.first_name}`);
console.log(`  Username:   @${b.username}`);
console.log(`  Open:       https://t.me/${b.username}`);
console.log(`  Bot ID:     ${b.id}`);
console.log(
  `  Inline:     ${b.supports_inline_queries ? "enabled" : "disabled"}`,
);

const updates = await fetch(api("getUpdates?limit=20")).then((r) => r.json());
console.log("\nRecent chats (write any message to your bot, then re-run)");
console.log("─────────────────────────────────────────────────────────");
if (!updates.ok || !updates.result.length) {
  console.log("  (no messages yet — open https://t.me/" + b.username + " and send /start)");
} else {
  const seen = new Set();
  for (const u of updates.result) {
    const c = u.message?.chat;
    if (!c || seen.has(c.id)) continue;
    seen.add(c.id);
    const who = [c.first_name, c.last_name].filter(Boolean).join(" ") || c.title || "?";
    console.log(`  chat_id ${c.id}  ·  ${who}  ·  type=${c.type}`);
  }
  console.log(
    "\n  → copy your chat_id into .env.local as TELEGRAM_LEAD_CHAT_ID",
  );
}
console.log("");
