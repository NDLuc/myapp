import { deleteEvent } from "@/lib/events"

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return Response.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      )
    }

    const result = await deleteEvent(id)

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("[v0] DELETE /api/events/delete error:", errorMsg)
    return Response.json(
      { success: false, error: errorMsg },
      { status: 500 }
    )
  }
}
