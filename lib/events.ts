import { createClient } from "@/lib/supabase/server"
import type {
  AnomalyEvent,
  SyncStatus,
  VibrationLevel,
} from "@/lib/events-types"

export type { AnomalyEvent, SyncStatus, VibrationLevel } from "@/lib/events-types"
export { LEVEL_LABEL } from "@/lib/events-types"

// Real row shape from the public."Tracking" table in Supabase
type TrackingRow = {
  id: number | string
  created_at: string
  lat: number | string | null
  long: number | string | null
  time: string | null
  speed: number | string | null
  vibrate: number | string | null
  abnormal: string | null
}

function levelFromAbnormal(abnormal: string | null): VibrationLevel {
  // "hard" (and similar strong signals) => high, otherwise medium
  const a = (abnormal ?? "").toLowerCase()
  return a.includes("hard") || a.includes("high") || a.includes("cao")
    ? "high"
    : "medium"
}

function abnormalLabel(abnormal: string | null): string {
  if (!abnormal) return "Bất thường"
  const map: Record<string, string> = {
    hard: "Rung mạnh",
    soft: "Rung nhẹ",
    medium: "Rung trung bình",
  }
  return map[abnormal.toLowerCase()] ?? abnormal
}

function mapRow(row: TrackingRow): AnomalyEvent {
  const d = new Date(row.time ?? row.created_at)
  const lat = Number(row.lat ?? 0)
  const lng = Number(row.long ?? 0)
  return {
    id: String(row.id),
    time: d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    }),
    date: d.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
    ts: d.getTime(),
    // No address column in the table: show coordinates as the primary label
    street: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    district: abnormalLabel(row.abnormal),
    level: levelFromAbnormal(row.abnormal),
    sync: "synced",
    speed: Number(row.speed ?? 0),
    vibration: Number(row.vibrate ?? 0),
    lat,
    lng,
  }
}

export async function getEvents(): Promise<AnomalyEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("Tracking")
    .select("*")
    .order("time", { ascending: false })

  if (error) {
    console.log("[v0] getEvents error:", error.message)
    return []
  }
  console.log("[v0] getEvents rows:", data?.length, JSON.stringify(data?.[0]))
  return (data as TrackingRow[]).map(mapRow)
}

export async function getEvent(id: string): Promise<AnomalyEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("Tracking")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    if (error) console.log("[v0] getEvent error:", error.message)
    return null
  }
  return mapRow(data as TrackingRow)
}
