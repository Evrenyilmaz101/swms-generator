// Server-side Supabase client (service role — full access)
// Only import this in API routes (server-only)
//
// NOTE: We use an untyped client here because the Supabase
// auto-generated types require a running schema introspection.
// Our Database type definition provides documentation but the
// client works with `any` to avoid build errors before tables exist.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
      );
    }

    _supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _supabase;
}
