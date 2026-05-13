"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const codegen = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

const schema = z.object({
  owner_name: z.string().min(2).max(80),
  owner_phone: z.string().regex(/^\+?[0-9()\s-]{7,20}$/),
  percent: z.number().int().min(1).max(50),
  code: z.string().regex(/^[A-Z0-9]{3,12}$/).optional(),
});

export type ReferralInput = z.input<typeof schema>;

export async function createReferralCode(
  input: ReferralInput,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };
  const svc = createSupabaseServiceClient();
  const { data: admin } = await svc.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return { ok: false, error: "forbidden" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }
  const code = parsed.data.code ?? codegen();

  const { error } = await svc.from("referral_codes").insert({
    code,
    owner_name: parsed.data.owner_name,
    owner_phone: parsed.data.owner_phone,
    percent: parsed.data.percent,
    active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/referrals");
  return { ok: true, code };
}
