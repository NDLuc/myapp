import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const tableNames = [
      "dataTracking",
      "data_tracking",
      "DataTracking",
      "Tracking",
      "tracking",
      "events",
    ]

    const results: Record<string, number | string> = {}

    for (const table of tableNames) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true })

        if (error) {
          results[table] = `Error: ${error.message}`
        } else {
          results[table] = data?.length ?? 0
        }
      } catch (e) {
        results[table] = `Exception: ${e instanceof Error ? e.message : String(e)}`
      }
    }

    return Response.json(results)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
