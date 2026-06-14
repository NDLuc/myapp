import { cn } from "@/lib/utils"
import { CloudCheck, RefreshCw } from "lucide-react"
import type { SyncStatus, VibrationLevel } from "@/lib/events-types"
import { LEVEL_LABEL } from "@/lib/events-types"

export function LevelBadge({ level }: { level: VibrationLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        level === "high"
          ? "bg-destructive/10 text-destructive"
          : "bg-amber-500/15 text-amber-600",
      )}
    >
      {LEVEL_LABEL[level]}
    </span>
  )
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  if (status === "synced") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CloudCheck className="h-4 w-4" />
        Đã đồng bộ
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <RefreshCw className="h-3.5 w-3.5" />
      Đang đồng bộ
    </span>
  )
}
