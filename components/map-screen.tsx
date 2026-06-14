"use client"

import { useMemo, useRef, useState } from "react"
import { Calendar } from "lucide-react"
import { AnomalyMap } from "@/components/anomaly-map"
import type { AnomalyEvent } from "@/lib/events-types"

// "2026-06-14" -> "14/6/2026" (khớp định dạng vi-VN của event.date)
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${Number(d)}/${Number(m)}/${y}`
}

function todayIso(): string {
  // yyyy-mm-dd theo giờ Việt Nam
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })
}

export function MapScreen({
  events,
  focusId,
}: {
  events: AnomalyEvent[]
  focusId?: string
}) {
  const [dateIso, setDateIso] = useState<string>(todayIso())
  const dateInputRef = useRef<HTMLInputElement>(null)

  function openDatePicker() {
    const el = dateInputRef.current
    if (!el) return
    // showPicker mở native calendar; fallback focus/click cho trình duyệt cũ
    if (typeof el.showPicker === "function") {
      el.showPicker()
    } else {
      el.focus()
      el.click()
    }
  }

  const displayDate = isoToDisplay(dateIso)

  const filteredEvents = useMemo(
    () => events.filter((e) => e.date === displayDate),
    [events, displayDate],
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* stats card */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="grid grid-cols-2 items-center divide-x divide-border">
              <div className="pr-3">
              <p className="text-xs text-muted-foreground">Tổng điểm bất thường</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-destructive">
                  {filteredEvents.length}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  {dateIso === todayIso() ? "Hôm nay" : "Đã chọn"}
                </span>
              </div>
            </div>
              <div className="relative pl-3">
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="flex w-full flex-col items-start text-left"
                >
                  <span className="text-xs text-muted-foreground">Ngày</span>
                  <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                    {displayDate}
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </span>
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dateIso}
                  onChange={(e) => setDateIso(e.target.value)}
                  className="pointer-events-none absolute bottom-0 left-3 h-0 w-0 opacity-0"
                  aria-label="Chọn ngày"
                  tabIndex={-1}
                />
            </div>
          </div>
        </div>
      </div>

      {/* map */}
      <div className="relative flex-1 overflow-hidden">
        <AnomalyMap events={filteredEvents} focusId={focusId} />
      </div>
    </div>
  )
}
