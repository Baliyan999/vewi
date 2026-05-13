import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/payments";
import { notifyAdmin, notifyEvent } from "@/lib/telegram";
import type { PaymentProvider } from "@/lib/payments/types";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const adapter = getProvider(provider as PaymentProvider);
  if (!adapter) return NextResponse.json({ error: "unknown_provider" }, { status: 400 });

  // Parse body once (different providers send JSON vs form vs JSON-RPC)
  const ct = req.headers.get("content-type") ?? "";
  let body: unknown;
  if (ct.includes("application/json")) body = await req.json().catch(() => null);
  else if (ct.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    body = Object.fromEntries(form.entries());
  } else body = await req.text();

  const verdict = await adapter.verifyWebhook(body, req.headers);
  if (!verdict.valid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 403 });
  }
  if (!verdict.orderId) {
    return NextResponse.json({ ok: true });
  }

  const svc = createSupabaseServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("id, event_id, amount_uzs, status, tariff_code")
    .eq("id", verdict.orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  if (verdict.amountUzs && verdict.amountUzs !== order.amount_uzs) {
    return NextResponse.json({ error: "amount_mismatch" }, { status: 400 });
  }

  if (order.status !== "paid") {
    await svc
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        provider_ref: verdict.providerRef ?? null,
      })
      .eq("id", order.id);

    // Activate event
    if (order.event_id) {
      await svc.from("events").update({ status: "active" }).eq("id", order.event_id);

      // Calculate referral commission if applicable
      const { data: ref } = await svc
        .from("referrals")
        .select("code, referral_codes!inner(percent)")
        .eq("order_id", order.id)
        .maybeSingle();
      if (ref) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const percent = (ref as any).referral_codes.percent as number;
        await svc
          .from("referrals")
          .update({
            commission_uzs: Math.round((order.amount_uzs * percent) / 100),
          })
          .eq("order_id", order.id);
      }

      await notifyEvent(order.event_id, {
        text: `✅ Оплата прошла. Ваше событие активировано. Тариф: ${order.tariff_code}.`,
      });
    }

    await notifyAdmin(
      `💸 Оплата ${order.amount_uzs.toLocaleString("ru-RU")} UZS · ${provider} · order ${order.id}`,
    );
  }

  return NextResponse.json({ ok: true });
}
