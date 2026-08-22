"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

let browserClient;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return browserClient;
}

export const supabase = createClient();