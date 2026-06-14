"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, ChevronRight, ChevronDown } from "lucide-react"
import { PhoneShell } from "@/components/phone-shell"
import { BottomNav } from "@/components/bottom-nav"
import { LevelBadge, SyncBadge } from "@/components/badges"
import type { AnomalyEvent } from "@/lib/events-types"

const ranges = [
  { key: "today", label: "Hôm nay", count: 12 },
  { key: "7days", label: "7 ngày qua", count: 38 },
  { key: "30days", label: "30 ngày qua", count: 126 },
] as const

export function EventsScreen({ events }: { events: AnomalyEvent[] }) {
  const [range, setRange] = useState<(typeof ranges)[number]["key"]>("today")

  return (
    <PhoneShell>
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <button type="button" aria-label="Menu" className="p-1 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Sự kiện bất thường</h1>
        <button type="button" aria-label="Tìm kiếm" className="p-1 text-foreground">
          <Search className="h-5 w-5" />
        </button>
      </header>

      {/* range tabs */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {ranges.map((r) => {
            const active = range === r.key
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition-colors ${active
                    ? "border-primary bg-accent text-primary"
                    : "border-border bg-card text-foreground"
                  }`}
              >
                <span className="text-sm font-medium">{r.label}</span>
                <span
                  className={`text-base font-bold ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  {r.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* list header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <p className="text-sm font-medium text-muted-foreground">
          {events.length} sự kiện
        </p>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground"
        >
          Mới nhất <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <ul className="flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.id}`}
                className="flex items-stretch gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex w-16 shrink-0 flex-col items-start gap-1 border-r border-border pr-3">
                  <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    {e.time}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{e.date}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{e.street}</p>
                      <p className="text-xs text-muted-foreground">{e.district}</p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <LevelBadge level={e.level} />
                    <SyncBadge status={e.sync} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </PhoneShell>
  )
}
