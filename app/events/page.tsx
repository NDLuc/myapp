import { EventsScreen } from "@/components/events-screen"
import { getEvents } from "@/lib/events"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EventsPage() {
  const events = await getEvents()

  return <EventsScreen events={events} />
}