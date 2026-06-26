import { TrackingTabs } from "@/components/tracking-tabs"
import { getEvents } from "@/lib/events"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>
}) {
  const { focus } = await searchParams
  const events = await getEvents()

  return <TrackingTabs initialEvents={events} initialFocusId={focus} />
}