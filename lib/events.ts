import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import type {
  AnomalyEvent,
  SyncStatus,
  VibrationLevel,
} from "@/lib/events-types"

export type { AnomalyEvent, SyncStatus, VibrationLevel } from "@/lib/events-types"
export { LEVEL_LABEL } from "@/lib/events-types"

type PacketType = "warning" | "keepalive"

// Real row shape from the public."dataTracking" table in Supabase
type TrackingRow = {
  id: string
  device_id: string
  packet_type: PacketType
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

function levelFromPacket(packetType: PacketType, score: number | null): VibrationLevel {
  // Gói keepalive chỉ là tracking bình thường
  if (packetType === "keepalive") {
    return "medium"
  }

  // Gói warning là cảnh báo bất thường
  if (score === null || score === undefined) {
    return "high"
  }

  return score > 0.7 ? "high" : "medium"
}

function statusLabel(status: string | null, packetType: PacketType): string {
  // Nếu database không có status thì phân loại theo packet_type
  if (!status) {
    return packetType === "warning" ? "Bất thường" : "Bình thường"
  }

  const map: Record<string, string> = {
    warning: "Bất thường",
    keepalive: "Bình thường",
    online: "Bình thường",
    normal: "Bình thường",

    "bất thường": "Bất thường",
    "binh thuong": "Bình thường",
    "bình thường": "Bình thường",

    "rung mạnh": "Bất thường",
    "rung cao": "Bất thường",
    "rung nhẹ": "Bình thường",
    "rung trung bình": "Bình thường",
  }

  return map[status.toLowerCase()] ?? status
}

function parseDeviceTime(deviceTime: string | null): Date {
  if (!deviceTime) return new Date()

  // Parse format "25/06/2026 - 01:02:15"
  // device_time từ ESP32/Supabase là giờ Việt Nam UTC+7
  const match = deviceTime.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2}):(\d{1,2}):(\d{1,2})/,
  )

  if (match) {
    const [, d, m, y, h, min, s] = match

    // Tạo Date theo UTC từ chuỗi giờ Việt Nam
    const utcDate = new Date(
      Date.UTC(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h),
        Number(min),
        Number(s),
      ),
    )

    // Vì chuỗi gốc là giờ Việt Nam UTC+7 nên trừ 7 giờ để ra UTC thực
    return new Date(utcDate.getTime() - 7 * 60 * 60 * 1000)
  }

  const fallbackDate = new Date(deviceTime)

  if (Number.isNaN(fallbackDate.getTime())) {
    return new Date()
  }

  return fallbackDate
}

function mapRow(row: TrackingRow): AnomalyEvent {
  try {
    const packetType = row.packet_type

    // Ưu tiên device_time nếu có, không thì dùng created_at
    const d = row.device_time
      ? parseDeviceTime(row.device_time)
      : new Date(row.created_at)

    const lat = Number(row.lat ?? 0)
    const lng = Number(row.lng ?? 0)

    const event = {
      id: String(row.id),

      // Giữ cả 2 field để code cũ và code mới đều dùng được
      packet_type: packetType,
      packetType: packetType,

      time: d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh",
      }),

      date: d.toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),

      ts: d.getTime(),

      // Hiển thị tọa độ
      street: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,

      // Bất thường / Bình thường
      district: statusLabel(row.status, packetType),

      level: levelFromPacket(packetType, row.anomaly_score),

      sync: "synced" as SyncStatus,

      speed: Number(row.speed_kmh ?? 0),
      vibration: Number(row.anomaly_score ?? 0),

      lat,
      lng,
    }

    return event as AnomalyEvent
  } catch (err) {
    console.log(
      "[v0] mapRow error for",
      row.id,
      ":",
      err instanceof Error ? err.message : String(err),
    )
    throw err
  }
}

export async function getEvents(): Promise<AnomalyEvent[]> {
  console.log("[v0] getEvents: fetching from dataTracking")

  try {
    const supabase = await createClient()
    console.log("[v0] supabase client ready")

    const { data, error } = await supabase
      .from("dataTracking")
      .select("*")
      .order("created_at", { ascending: false })

    console.log(
      "[v0] query result - error:",
      error?.message,
      "data length:",
      data?.length,
    )

    if (error) {
      console.error("[v0] getEvents query error:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.log("[v0] no data returned from dataTracking")
      return []
    }

    console.log("[v0] first row:", JSON.stringify(data[0]).substring(0, 300))

    const mapped = (data as TrackingRow[])
      .filter((row) => {
        // Bỏ qua events với lat/lng = null hoặc = 0
        const lat = Number(row.lat ?? 0)
        const lng = Number(row.lng ?? 0)

        return lat !== 0 && lng !== 0
      })
      .map(mapRow)

    console.log("[v0] mapped", mapped.length, "events after filtering")

    return mapped
  } catch (err) {
    console.error("[v0] getEvents exception:", err)
    return []
  }
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

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Use service role client to bypass RLS policies
    const supabase = createServiceRoleClient()

    console.log("[v0] Attempting to delete event with service role:", id)
    
    const { error, status } = await supabase
      .from("dataTracking")
      .delete()
      .eq("id", id)

    console.log("[v0] deleteEvent response - status:", status, "error:", error)

    if (error) {
      console.error("[v0] deleteEvent error:", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      })
      return { success: false, error: `${error.message} (${error.code})` }
    }

    console.log("[v0] Event deleted successfully:", id)
    return { success: true }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("[v0] deleteEvent exception:", errorMsg)
    return { success: false, error: errorMsg }
  }
}
