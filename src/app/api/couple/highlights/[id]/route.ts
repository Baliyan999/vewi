import { NextResponse } from "next/server";
import sharp from "sharp";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_TO_RANK = 200;
const TOP_N = 30;

/**
 * AI-подборка highlights без внешних моделей: считаем «резкость» как
 * variance Лапласиана на даунсемпле 256px. Самые резкие N кадров
 * помечаем is_highlight=true. Дёшево, работает оффлайн, не требует GPU.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { id } = await params;

  // Verify ownership
  const { data: event } = await svc
    .from("events")
    .select("id, couples!inner(user_id)")
    .eq("id", id)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!event || (event as any).couples.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: media } = await svc
    .from("media")
    .select("id, storage_path")
    .eq("event_id", id)
    .eq("kind", "photo")
    .eq("status", "ready")
    .limit(MAX_TO_RANK);
  if (!media || media.length === 0) {
    return NextResponse.json({ ok: true, ranked: 0 });
  }

  const scores: Array<{ id: string; score: number }> = [];
  for (const m of media) {
    try {
      const { data: blob } = await svc.storage
        .from("event-photos")
        .download(m.storage_path);
      if (!blob) continue;
      const buf = Buffer.from(await blob.arrayBuffer());
      const score = await sharpnessScore(buf);
      scores.push({ id: m.id, score });
    } catch (err) {
      console.warn("[highlights] score failed", m.id, err);
    }
  }

  scores.sort((a, b) => b.score - a.score);
  const topIds = new Set(scores.slice(0, TOP_N).map((s) => s.id));

  // Reset previous highlights for this event, then mark the new top set
  await svc.from("media").update({ is_highlight: false }).eq("event_id", id);
  if (topIds.size > 0) {
    await svc
      .from("media")
      .update({ is_highlight: true })
      .in("id", Array.from(topIds));
  }

  return NextResponse.json({ ok: true, ranked: scores.length, top: topIds.size });
}

/**
 * Variance-of-Laplacian on 256px greyscale. Higher → sharper.
 */
async function sharpnessScore(buf: Buffer): Promise<number> {
  const img = sharp(buf).rotate().resize(256, 256, { fit: "inside" }).greyscale();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap =
        -4 * data[i] +
        data[i - 1] +
        data[i + 1] +
        data[i - w] +
        data[i + w];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}
