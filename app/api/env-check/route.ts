export async function GET() {
  return Response.json({
    url_public: process.env.NEXT_PUBLIC_SUPABASE_URL,
    url_tracking: process.env.NEXT_PUBLIC_TRACKING_SUPABASE_URL,
    key_public: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    key_tracking: process.env.NEXT_PUBLIC_TRACKING_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
  })
}
