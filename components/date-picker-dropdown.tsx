"use client"

import { useEffect, useRef, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
]

// "2026-06-14" -> "14/6/2026"
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${Number(d)}/${Number(m)}/${y}`
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export function DatePickerDropdown({
  value,
  onChange,
  label = "Ngày",
}: {
  value: string
  onChange: (iso: string) => void
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [vy, vm, vd] = value.split("-").map(Number)
  const [viewYear, setViewYear] = useState(vy)
  const [viewMonth, setViewMonth] = useState(vm - 1) // 0-indexed

  // đồng bộ lại tháng đang xem mỗi khi mở
  useEffect(() => {
    if (open) {
      setViewYear(vy)
      setViewMonth(vm - 1)
    }
  }, [open, vy, vm])

  // đóng khi bấm ra ngoài
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const firstDay = new Date(viewYear, viewMonth, 1)
  // chuyển CN(0) -> 6, T2(1) -> 0 ... để tuần bắt đầu từ thứ Hai
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }

  function selectDay(d: number) {
    onChange(toIso(viewYear, viewMonth, d))
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="mt-1 flex cursor-pointer items-center gap-1 text-sm font-semibold text-foreground"
      >
        {isoToDisplay(value)}
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chọn ngày"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Tháng trước"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Tháng sau"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="flex h-7 items-center justify-center text-[11px] font-medium text-muted-foreground"
              >
                {w}
              </div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div key={`e-${i}`} className="h-8" />
              const iso = toIso(viewYear, viewMonth, d)
              const isSelected = iso === value
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={
                    "flex h-8 items-center justify-center rounded-md text-sm transition-colors " +
                    (isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-foreground hover:bg-muted")
                  }
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
