/**
 * Telegram-bot helpers.
 *
 * - notifyAdmin: pings the lead/admin chat. Used for new leads.
 * - notifyEvent: pings the couple if they bound their `telegram_chat_id`
 *   (column added when couple links their bot in the dashboard).
 *
 * All calls are silent on missing env vars — never throw upstream.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/server";

const API = "https://api.telegram.org";

async function send(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[telegram] send failed", err);
    return false;
  }
}

export async function notifyAdmin(text: string): Promise<boolean> {
  const chat = process.env.TELEGRAM_LEAD_CHAT_ID;
  if (!chat) return false;
  return send(chat, text);
}

export async function notifyEvent(
  eventId: string,
  payload: { text: string },
): Promise<boolean> {
  const svc = createSupabaseServiceClient();
  const { data } = await svc
    .from("events")
    .select("title, couples!inner(telegram_chat_id)")
    .eq("id", eventId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatId = (data as any)?.couples?.telegram_chat_id;
  if (!chatId) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const title = (data as any)?.title ?? "";
  return send(chatId, `<b>${title}</b>\n${payload.text}`);
}
