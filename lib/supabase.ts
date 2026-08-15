import "server-only";
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !serverKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, serverKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
