import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    console.log("[v0] DEBUG: supabase client created")

    const { data, error } = await supabase
      .from("dataTracking")
      .select("*")
      .limit(5)

    if (error) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 },
      )
    }

    return Response.json({
      count: data?.length,
      sample: data?.[0],
      all: data,
    })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
