import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
