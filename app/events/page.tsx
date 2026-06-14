import { EventsScreen } from "@/components/events-screen"
import { getEvents } from "@/lib/events"

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsScreen events={events} />
}
