import fs from "fs/promises";

type Point = {
  lat: number;
  lng: number;
};

const INPUT_FILE = "data/roadLine.geojson";
const OUTPUT_FILE = "data/denseRoadPoints.json";

const MAX_SEGMENT_METERS = 5;
const EARTH_RADIUS = 6371000;

function distanceMeters(a: Point, b: Point): number {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function interpolatePoint(a: Point, b: Point, t: number): Point {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

function roundPoint(point: Point): Point {
  return {
    lat: Number(point.lat.toFixed(7)),
    lng: Number(point.lng.toFixed(7)),
  };
}

function coordinatesToPoints(coordinates: number[][]): Point[] {
  return coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));
}

function densifyLine(line: Point[], maxSegmentMeters: number): Point[] {
  if (line.length < 2) return [];

  const result: Point[] = [];

  for (let i = 0; i < line.length - 1; i++) {
    const start = line[i];
    const end = line[i + 1];

    result.push(roundPoint(start));

    const distance = distanceMeters(start, end);

    if (distance <= maxSegmentMeters) {
      continue;
    }

    const parts = Math.ceil(distance / maxSegmentMeters);

    for (let j = 1; j < parts; j++) {
      const t = j / parts;
      const newPoint = interpolatePoint(start, end, t);

      result.push(roundPoint(newPoint));
    }
  }

  result.push(roundPoint(line[line.length - 1]));

  return result;
}

function removeDuplicatePoints(points: Point[]): Point[] {
  const seen = new Set<string>();
  const result: Point[] = [];

  for (const point of points) {
    const key = `${point.lat},${point.lng}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(point);
  }

  return result;
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf-8");
  const geojson = JSON.parse(raw);

  if (!geojson.features || !Array.isArray(geojson.features)) {
    throw new Error("File roadLine.geojson không đúng dạng FeatureCollection");
  }

  let allRoadPoints: Point[] = [];

  for (const feature of geojson.features) {
    const geometry = feature.geometry;

    if (!geometry) continue;

    if (geometry.type === "LineString") {
      const line = coordinatesToPoints(geometry.coordinates);
      const densePoints = densifyLine(line, MAX_SEGMENT_METERS);

      allRoadPoints.push(...densePoints);
    }

    if (geometry.type === "MultiLineString") {
      for (const coordinates of geometry.coordinates) {
        const line = coordinatesToPoints(coordinates);
        const densePoints = densifyLine(line, MAX_SEGMENT_METERS);

        allRoadPoints.push(...densePoints);
      }
    }
  }

  allRoadPoints = removeDuplicatePoints(allRoadPoints);

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(allRoadPoints, null, 2),
    "utf-8"
  );

  console.log(`Generated ${allRoadPoints.length} road points`);
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});