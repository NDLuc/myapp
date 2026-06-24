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

function parseDeviceTime(deviceTime: string | null): Date {
  if (!deviceTime) return new Date()
  // Parse format "25/06/2026 - 01:02:15" to Date
  const match = deviceTime.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2}):(\d{2})/)
  if (match) {
    const [, d, m, y, h, min, s] = match
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s))
  }
  // Fallback: try ISO/standard format
  try {
    return new Date(deviceTime)
  } catch {
    return new Date()
  }
}

function mapRow(row: TrackingRow): AnomalyEvent {
  // Ưu tiên device_time nếu có, không thì dùng created_at
  const d = row.device_time ? parseDeviceTime(row.device_time) : new Date(row.created_at)
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
  console.log("[v0] getEvents called")
  const supabase = await createClient()
  console.log("[v0] supabase client created")
  const { data, error } = await supabase
    .from("dataTracking")
    .select("*")
    .in("packet_type", ["warning", "keepalive"])
    .order("created_at", { ascending: false })

  if (error) {
    console.log("[v0] getEvents error:", error.message, error)
    return []
  }
  console.log("[v0] getEvents rows fetched:", data?.length)
  if (data?.[0]) {
    console.log("[v0] first row sample:", JSON.stringify(data[0]).substring(0, 200))
  }
  const mapped = (data as TrackingRow[]).map(mapRow)
  console.log("[v0] mapped events count:", mapped.length)
  return mapped
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
