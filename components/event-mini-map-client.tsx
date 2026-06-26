"use client"

import { CircleMarker, MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { AnomalyEvent } from "@/lib/events-types"
import { findNearestRoadPoint } from "@/lib/mapMatching"

export function EventMiniMapClient({ event }: { event: AnomalyEvent }) {
  const high = event.level === "high"
  const color = high ? "#dc2626" : "#22c55e"

  const matchedPoint = findNearestRoadPoint({
    lat: event.lat,
    lng: event.lng,
  })

  return (
    <MapContainer
      key={`${event.id}-${matchedPoint.lat}-${matchedPoint.lng}`}
      center={[matchedPoint.lat, matchedPoint.lng]}
      zoom={15}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      className="h-full w-full"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker
        center={[matchedPoint.lat, matchedPoint.lng]}
        radius={13}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.4,
          weight: 2,
        }}
      />
    </MapContainer>
  )
}