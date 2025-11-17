import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || "";
  const anon = process.env.SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || (!anon && !service)) {
    throw new Error("server_env_missing");
  }
  const key = service || anon;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
