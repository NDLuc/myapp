import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Use the dedicated Tracking Supabase project (where the real `Tracking` data lives)
  // and fall back to the default integration env vars if the tracking ones are not set.
  const rawUrl =
    process.env.NEXT_PUBLIC_TRACKING_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_TRACKING_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  // Normalize: the Supabase client expects only the project origin
  // (e.g. https://xxxx.supabase.co), not a full REST path like /rest/v1/.
  const url = rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "")

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  })
}
