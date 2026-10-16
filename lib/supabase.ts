import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* harus dirujuk literal agar di-inline saat build.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase belum dikonfigurasi: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local lalu restart dev server.");
  return (client ??= createClient(url, anonKey));
}

export const BUCKET = "design-previews";
