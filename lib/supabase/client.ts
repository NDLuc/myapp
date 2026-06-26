import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_TRACKING_SUPABASE_URL!.replace("/rest/v1/", ""),
    process.env.NEXT_PUBLIC_TRACKING_SUPABASE_ANON_KEY!,
  )
}