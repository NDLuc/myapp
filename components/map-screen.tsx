"use client"

import { useMemo, useState } from "react"
import { AnomalyMap } from "@/components/anomaly-map"
import { DatePickerDropdown } from "@/components/date-picker-dropdown"
import type { AnomalyEvent } from "@/lib/events-types"

type ViewMode = "day" | "week" | "month"

// "2026-06-14" -> "14/6/2026" (khớp định dạng vi-VN của event.date)
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${Number(d)}/${Number(m)}/${y}`
}

// "14/6/2026" -> "2026-06-14"
function displayToIso(display: string): string {
  const [d, m, y] = display.split("/")
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
}

function isoFromDate(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}

// khoảng [thứ Hai, Chủ nhật] (ISO) của tuần chứa ngày iso
function weekRange(iso: string): [string, string] {
  const [y, m, d] = iso.split("-").map(Number)
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7 // T2 = 0
  const start = new Date(y, m - 1, d - dow)
  const end = new Date(y, m - 1, d - dow + 6)
  return [isoFromDate(start), isoFromDate(end)]
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
  const [viewMode, setViewMode] = useState<ViewMode>("day")

  // tập ngày (ISO) có ít nhất một điểm bất thường, để đánh dấu trên lịch
  const anomalyDates = useMemo(() => {
    const set = new Set<string>()
    for (const e of events) set.add(displayToIso(e.date))
    return set
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const eventIso = displayToIso(e.date)
      if (viewMode === "day") return eventIso === dateIso
      if (viewMode === "month") return eventIso.slice(0, 7) === dateIso.slice(0, 7)
      // week
      const [start, end] = weekRange(dateIso)
      return eventIso >= start && eventIso <= end
    })
  }, [events, dateIso, viewMode])

  const isToday = dateIso === todayIso()
  const subtitle =
    viewMode === "month"
      ? "Trong tháng"
      : viewMode === "week"
        ? "Trong tuần"
        : isToday
          ? "Hôm nay"
          : "Đã chọn"

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
                  {subtitle}
                </span>
              </div>
            </div>
              <div className="pl-3">
                <DatePickerDropdown
                  value={dateIso}
                  onChange={setDateIso}
                  markedDates={anomalyDates}
                />
              </div>
          </div>

          {/* bộ chọn khoảng thời gian hiển thị trên bản đồ */}
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
            {(
              [
                ["day", "Ngày"],
                ["week", "Tuần"],
                ["month", "Tháng"],
              ] as [ViewMode, string][]
            ).map(([mode, text]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className={
                  "rounded-md py-1.5 text-sm font-medium transition-colors " +
                  (viewMode === mode
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {text}
              </button>
            ))}
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
