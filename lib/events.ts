import { createClient } from "@/lib/supabase/server"
import type {
  AnomalyEvent,
  SyncStatus,
  VibrationLevel,
} from "@/lib/events-types"

export type { AnomalyEvent, SyncStatus, VibrationLevel } from "@/lib/events-types"
export { LEVEL_LABEL } from "@/lib/events-types"

// Real row shape from the public."dataTracking" table in Supabase
type TrackingRow = {
  id: string
  device_id: string
  packet_type: "warning" | "keepalive"
  status: string | null
  anomaly_score: number | null
  idle_prob: number | null
  normal_prob: number | null
  lat: number | null
  lng: number | null
  speed_kmh: number | null
  device_time: string | null
  created_at: string
}

function levelFromAnomalyScore(score: number | null): VibrationLevel {
  // anomaly_score cao => high risk, thấp => medium
  if (!score) return "medium"
  return score > 0.7 ? "high" : "medium"
}

function statusLabel(status: string | null): string {
  if (!status) return "Bất thường"
  const map: Record<string, string> = {
    "rung mạnh": "Rung mạnh",
    "rung nhẹ": "Rung nhẹ",
    "rung trung bình": "Rung trung bình",
  }
  return map[status.toLowerCase()] ?? status
}

function mapRow(row: TrackingRow): AnomalyEvent {
  // Ưu tiên device_time nếu có, không thì dùng created_at
  const d = new Date(row.device_time ?? row.created_at)
  const lat = Number(row.lat ?? 0)
  const lng = Number(row.lng ?? 0)
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
    // Hiển thị device_id và tọa độ
    street: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    district: statusLabel(row.status),
    level: levelFromAnomalyScore(row.anomaly_score),
    sync: "synced",
    speed: Number(row.speed_kmh ?? 0),
    vibration: Number(row.anomaly_score ?? 0),
    lat,
    lng,
    packetType: row.packet_type,
  }
}

export async function getEvents(): Promise<AnomalyEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("dataTracking")
    .select("*")
    .in("packet_type", ["warning", "keepalive"])
    .order("created_at", { ascending: false })

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
    .from("dataTracking")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    if (error) console.log("[v0] getEvent error:", error.message)
    return null
  }
  return mapRow(data as TrackingRow)
}
