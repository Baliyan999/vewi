import archiver from "archiver";
import { PassThrough } from "node:stream";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const svc = createSupabaseServiceClient();
  const { id } = await params;

  // Verify ownership
  const { data: event } = await svc
    .from("events")
    .select("id, title, couples!inner(user_id)")
    .eq("id", id)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (event as any)?.couples?.user_id;
  if (!event || ownerId !== user.id) {
    return new Response("forbidden", { status: 403 });
  }

  const { data: media } = await svc
    .from("media")
    .select("storage_path, taken_at")
    .eq("event_id", id)
    .eq("kind", "photo")
    .eq("status", "ready")
    .order("taken_at", { ascending: true });

  const archive = archiver("zip", { zlib: { level: 1 } });
  const pass = new PassThrough();
  archive.pipe(pass);

  // Stream files into archive
  (async () => {
    for (const m of media ?? []) {
      const { data: blob } = await svc.storage.from("event-photos").download(m.storage_path);
      if (!blob) continue;
      const name = m.storage_path.split("/").pop() ?? "photo.jpg";
      archive.append(Buffer.from(await blob.arrayBuffer()), { name });
    }
    archive.finalize();
  })().catch((err) => {
    console.error("[zip] stream failed", err);
    archive.abort();
  });

  const webStream = nodeReadableToWeb(pass) as unknown as ReadableStream<Uint8Array>;
  return new Response(webStream, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.zip"`,
      "cache-control": "private, no-store",
    },
  });
}

function nodeReadableToWeb(stream: PassThrough) {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk)),
      );
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });
}
