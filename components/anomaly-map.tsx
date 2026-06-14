"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import type { Map as LeafletMapType } from "leaflet"
import { Plus, Minus } from "lucide-react"
import type { AnomalyEvent } from "@/lib/events-types"

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Đang tải bản đồ…
    </div>
  ),
})

export function AnomalyMap({
  events,
  focusId,
}: {
  events: AnomalyEvent[]
  focusId?: string
}) {
  const mapRef = useRef<LeafletMapType | null>(null)

  return (
    <div className="relative h-full w-full overflow-hidden">
      <LeafletMap
        events={events}
        focusId={focusId}
        onReady={(map) => {
          mapRef.current = map
        }}
      />

      {/* map zoom controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col items-center gap-3">
        <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-md">
          <button
            type="button"
            aria-label="Phóng to"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"
          >
            <Plus className="h-5 w-5" />
          </button>
          <span className="h-px w-full bg-border" />
          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"
          >
            <Minus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
