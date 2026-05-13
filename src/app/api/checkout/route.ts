import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/payments";

export const runtime = "nodejs";

const schema = z.object({
  event_id: z.string().uuid(),
  provider: z.enum(["click", "payme"]),
  referral_code: z.string().max(20).optional(),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  const { data: event } = await svc
    .from("events")
    .select("id, couple_id, tariff_code, couples!inner(user_id, phone), tariffs!inner(price_uzs)")
    .eq("id", parsed.data.event_id)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ev = event as any;
  if (!ev || ev.couples.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const amount = ev.tariffs.price_uzs as number;

  // Validate referral code if provided
  let referralCode: string | null = null;
  if (parsed.data.referral_code) {
    const { data: code } = await svc
      .from("referral_codes")
      .select("code, active")
      .eq("code", parsed.data.referral_code)
      .maybeSingle();
    if (code?.active) referralCode = code.code;
  }

  // Create pending order
  const { data: order, error: orderErr } = await svc
    .from("orders")
    .insert({
      event_id: ev.id,
      couple_id: ev.couple_id,
      tariff_code: ev.tariff_code,
      amount_uzs: amount,
      provider: parsed.data.provider,
      status: "pending",
    })
    .select("id")
    .single();
  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message ?? "order_failed" }, { status: 500 });
  }

  if (referralCode) {
    await svc.from("referrals").insert({
      code: referralCode,
      event_id: ev.id,
      order_id: order.id,
    });
  }

  const provider = getProvider(parsed.data.provider);
  if (!provider) {
    return NextResponse.json({ error: "provider_unsupported" }, { status: 400 });
  }
  const checkout = await provider.startCheckout({
    eventId: ev.id,
    tariff: ev.tariff_code,
    amountUzs: amount,
    couplePhone: ev.couples.phone,
    orderId: order.id,
  });
  if (!checkout.ok) {
    return NextResponse.json({ error: checkout.error }, { status: 500 });
  }
  return NextResponse.json({ redirectUrl: checkout.redirectUrl, orderId: order.id });
}
