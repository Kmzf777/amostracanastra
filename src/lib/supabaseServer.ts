import { createClient } from "@supabase/supabase-js";
import { env, assertServerEnv } from "@/lib/env";

export function getSupabaseServer() {
  assertServerEnv();
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  return createClient(env.SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
