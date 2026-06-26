"use client"

import { useEffect } from "react"
import type { Map as LeafletMapType } from "leaflet"
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { AnomalyEvent } from "@/lib/events-types"
import { findNearestRoadPoint } from "@/lib/mapMatching"

function MapEffects({
  events,
  focusId,
  onReady,
}: {
  events: AnomalyEvent[]
  focusId?: string
  onReady?: (map: LeafletMapType) => void
}) {
  const map = useMap()

  // expose the map instance to the parent for external controls
  useEffect(() => {
    onReady?.(map)
  }, [map, onReady])

  // focus a single event when requested, otherwise fit all events
  useEffect(() => {
    const focused = focusId ? events.find((e) => String(e.id) === String(focusId)) : undefined

    if (focused) {
      const matchedPoint = findNearestRoadPoint({
        lat: focused.lat,
        lng: focused.lng,
      })

      map.setView([matchedPoint.lat, matchedPoint.lng], 16, { animate: true })
      return
    }

    if (events.length === 0) return

    const bounds = events.map((e) => {
      const matchedPoint = findNearestRoadPoint({
        lat: e.lat,
        lng: e.lng,
      })

      return [matchedPoint.lat, matchedPoint.lng]
    }) as [number, number][]

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
  }, [events, focusId, map])

  return null
}

export default function LeafletMap({
  events,
  focusId,
  onReady,
}: {
  events: AnomalyEvent[]
  focusId?: string
  onReady?: (map: LeafletMapType) => void
}) {
  const firstMatchedPoint = events.length
    ? findNearestRoadPoint({
      lat: events[0].lat,
      lng: events[0].lng,
    })
    : null

  const center: [number, number] = firstMatchedPoint
    ? [firstMatchedPoint.lat, firstMatchedPoint.lng]
    : [10.7769, 106.7009]

  return (
    <MapContainer
      center={center}
      zoom={12}
      zoomControl={false}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map((e) => {
        // warning = red, keepalive = green
        const isWarning = e.packetType === "warning"
        const color = isWarning ? "#dc2626" : "#22c55e"
        const radius = isWarning ? 12 : 9

        const matchedPoint = findNearestRoadPoint({
          lat: e.lat,
          lng: e.lng,
        })

        return (
          <CircleMarker
            key={e.id}
            center={[matchedPoint.lat, matchedPoint.lng]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.35,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div className="text-xs">
                <div className="font-semibold">{e.street}</div>
                <div>{e.district}</div>
                <div>
                  {e.time} · {e.vibration} g
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}

      <MapEffects events={events} focusId={focusId} onReady={onReady} />
    </MapContainer>
  )
}