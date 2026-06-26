import fs from "fs/promises"
import path from "path"

const INPUT_DIR = "data/roadLine"
const OUTPUT_FILE = "data/roadLine.geojson"

async function main() {
  const files = await fs.readdir(INPUT_DIR)

  const geojsonFiles = files.filter((file) =>
    file.endsWith(".geojson")
  )

  const mergedFeatures: any[] = []
  const seenKeys = new Set<string>()

  for (const file of geojsonFiles) {
    const filePath = path.join(INPUT_DIR, file)
    const raw = await fs.readFile(filePath, "utf-8")
    const geojson = JSON.parse(raw)

    if (!geojson.features || !Array.isArray(geojson.features)) {
      console.warn(`Skip invalid GeoJSON: ${file}`)
      continue
    }

    for (const feature of geojson.features) {
      const key =
        feature.id ??
        feature.properties?.id ??
        JSON.stringify(feature.geometry)

      if (seenKeys.has(String(key))) {
        continue
      }

      seenKeys.add(String(key))
      mergedFeatures.push(feature)
    }
  }

  const mergedGeojson = {
    type: "FeatureCollection",
    features: mergedFeatures,
  }

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(mergedGeojson, null, 2),
    "utf-8"
  )

  console.log(`Merged ${mergedFeatures.length} road features`)
  console.log(`Saved to ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})