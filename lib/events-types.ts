export type VibrationLevel = "high" | "medium"
export type SyncStatus = "synced" | "syncing"

export type AnomalyEvent = {
  id: string
  time: string
  date: string
  street: string
  district: string
  level: VibrationLevel
  sync: SyncStatus
  speed: number
  vibration: number
  // real geographic coordinates from Supabase
  lat: number
  lng: number
}

export const LEVEL_LABEL: Record<VibrationLevel, string> = {
  high: "Mức rung cao",
  medium: "Mức rung trung bình",
}
