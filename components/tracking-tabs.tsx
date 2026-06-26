"use client"

import { useEffect, useState } from "react"
import { PhoneShell } from "@/components/phone-shell"
import { BottomNav } from "@/components/bottom-nav"
import { MapScreen } from "@/components/map-screen"
import { EventsScreen } from "@/components/events-screen"
import type { AnomalyEvent } from "@/lib/events-types"

type ActiveTab = "map" | "events"

export function TrackingTabs({
  initialEvents,
  initialFocusId,
}: {
  initialEvents: AnomalyEvent[]
  initialFocusId?: string
}) {
  const [events, setEvents] = useState(initialEvents)
  const [activeTab, setActiveTab] = useState<ActiveTab>("map")
  const [focusId, setFocusId] = useState<string | undefined>(initialFocusId)

  // Khi Supabase Realtime gọi router.refresh(),
  // server lấy dữ liệu mới và truyền lại initialEvents mới vào đây.
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  // Khi đi từ "Xem trên bản đồ" với /?focus=id
  useEffect(() => {
    setFocusId(initialFocusId)

    if (initialFocusId) {
      setActiveTab("map")
    }
  }, [initialFocusId])

  const title = activeTab === "map" ? "Bản đồ giám sát" : "Lịch sử giám sát"

  return (
    <PhoneShell>
      <header className="flex items-center justify-center px-4 pt-5 pb-3">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </header>

      {activeTab === "map" ? (
        <MapScreen events={events} focusId={focusId} />
      ) : (
        <EventsScreen events={events} embedded />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </PhoneShell>
  )
}