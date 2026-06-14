"use client"

import dynamic from "next/dynamic"
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { AnomalyEvent } from "@/lib/events-types"

function MiniMap({ event }: { event: AnomalyEvent }) {
  const high = event.level === "high"
  const color = high ? "#dc2626" : "#f59e0b"
  return (
    <MapContainer
      center={[event.lat, event.lng]}
      zoom={15}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      className="h-full w-full"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[event.lat, event.lng]}
        radius={13}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
      />
    </MapContainer>
  )
}

export const EventMiniMap = dynamic(() => Promise.resolve(MiniMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Đang tải bản đồ…
    </div>
  ),
})
