import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* harus dirujuk literal agar di-inline saat build.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.");
  return (client ??= createClient(url, anonKey));
}

export const BUCKET = "design-previews";
