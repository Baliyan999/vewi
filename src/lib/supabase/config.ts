/**
 * Returns true only when both anon URL and the relevant key are present.
 * Used to gracefully short-circuit pages (redirect to demo / show a setup
 * banner) instead of throwing the raw Supabase init error to end users.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isSupabaseServiceConfigured(): boolean {
  return Boolean(
    isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
