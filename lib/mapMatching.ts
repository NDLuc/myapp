import roadPoints from "../data/denseRoadPoints.json"

export type Point = {
  lat: number
  lng: number
}

const EARTH_RADIUS = 6371000

function distanceMeters(a: Point, b: Point): number {
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)

  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function findNearestRoadPoint(
  gps: Point,
  maxDistanceMeters = 3000
): Point {
  let nearestPoint = gps
  let nearestDistance = Infinity

  for (const point of roadPoints as Point[]) {
    const distance = distanceMeters(gps, point)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestPoint = point
    }
  }

  // Nếu GPS quá xa đường thì giữ nguyên GPS gốc
  if (nearestDistance > maxDistanceMeters) {
    return gps
  }

  return nearestPoint
}