"use client"

import dynamic from "next/dynamic"
import type { AnomalyEvent } from "@/lib/events-types"

const EventMiniMapClient = dynamic(
  () =>
    import("@/components/event-mini-map-client").then(
      (mod) => mod.EventMiniMapClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Đang tải bản đồ…
      </div>
    ),
  },
)

export function EventMiniMap({ event }: { event: AnomalyEvent }) {
  return <EventMiniMapClient event={event} />
}