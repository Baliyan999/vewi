"use server";

import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseServiceConfigured } from "@/lib/supabase/config";

const leadSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[+0-9()\s-]+$/, "invalid phone"),
  wedding_date: z.string().date().nullable().optional(),
  guests_estimate: z.number().int().min(10).max(1000).nullable().optional(),
  source: z.string().max(40).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;

export async function submitLead(
  input: LeadInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };
  }

  // Без Supabase отдаём лид в Telegram (если настроен) и считаем успех —
  // это удобно для первых дней, пока БД ещё не подключена.
  if (!isSupabaseServiceConfigured()) {
    await notifyTelegram(parsed.data).catch((err) => {
      console.error("[lead] telegram notify failed", err);
    });
    return { ok: true };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    wedding_date: parsed.data.wedding_date ?? null,
    guests_estimate: parsed.data.guests_estimate ?? null,
    source: parsed.data.source ?? "landing",
  });

  if (error) {
    console.error("[lead] insert failed", error);
    return { ok: false, error: "server error" };
  }

  await notifyTelegram(parsed.data).catch((err) => {
    console.error("[lead] telegram notify failed", err);
  });

  return { ok: true };
}

async function notifyTelegram(lead: z.infer<typeof leadSchema>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_LEAD_CHAT_ID;
  if (!token || !chatId) return;

  const text =
    `🎉 Новая заявка\n` +
    `Имя: ${lead.name}\n` +
    `Тел: ${lead.phone}\n` +
    (lead.wedding_date ? `Дата: ${lead.wedding_date}\n` : "") +
    (lead.guests_estimate ? `Гостей: ${lead.guests_estimate}\n` : "") +
    (lead.source ? `Источник: ${lead.source}` : "");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}
