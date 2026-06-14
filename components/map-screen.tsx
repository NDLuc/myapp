"use client"

import { useMemo, useState } from "react"
import { AnomalyMap } from "@/components/anomaly-map"
import { DatePickerDropdown } from "@/components/date-picker-dropdown"
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

  const displayDate = isoToDisplay(dateIso)

  const filteredEvents = useMemo(
    () => events.filter((e) => e.date === displayDate),
    [events, displayDate],
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* stats card */}
      <div className="relative z-[1000] px-4 pb-3">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="grid grid-cols-2 items-center divide-x divide-border">
              <div className="flex flex-col items-center pr-3 text-center">
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
              <div className="pl-3">
                <DatePickerDropdown value={dateIso} onChange={setDateIso} />
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
