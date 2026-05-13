import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { buildGuestUrl, toDataURL } from "@/lib/qr";
import { QrSheetDocument, type QrCardData } from "@/lib/qr-pdf";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { data: admin } = await svc.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const { data: event } = await svc
    .from("events")
    .select("id, title, wedding_date, short_code")
    .eq("id", id)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const url = new URL(req.url);
  const tablesParam = url.searchParams.get("tables");
  const tableCount = Math.min(Math.max(Number(tablesParam ?? 12) || 12, 1), 40);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`;

  const cards: QrCardData[] = [];
  for (let i = 1; i <= tableCount; i++) {
    const guestUrl = buildGuestUrl(base, {
      eventId: event.short_code,
      tableNumber: i,
    });
    const qrDataUrl = await toDataURL(guestUrl);
    cards.push({
      qrDataUrl,
      label: `Стол №${i}`,
      url: guestUrl.replace(/^https?:\/\//, ""),
    });
  }

  const buffer = await renderToBuffer(
    QrSheetDocument({
      eventTitle: event.title,
      weddingDate: event.wedding_date,
      cards,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="qr-${event.short_code}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
