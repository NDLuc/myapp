import { Suspense } from "react"
import { PhoneShell } from "@/components/phone-shell"
import { BottomNav } from "@/components/bottom-nav"
import { MapScreen } from "@/components/map-screen"
import { getEvents } from "@/lib/events"

async function MapData({ focusId }: { focusId?: string }) {
  const events = await getEvents()
  return <MapScreen events={events} focusId={focusId} />
}

function MapScreenFallback() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pb-3">
        <div className="h-[92px] animate-pulse rounded-2xl border border-border bg-muted/50" />
      </div>
      <div className="flex flex-1 items-center justify-center bg-muted text-sm text-muted-foreground">
        Đang tải bản đồ…
      </div>
    </div>
  )
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>
}) {
  const { focus } = await searchParams

  return (
    <PhoneShell>
      {/* header */}
      <header className="flex items-center justify-center px-4 pt-5 pb-3">
        <h1 className="text-lg font-semibold text-foreground">Vị trí bất thường</h1>
      </header>

      <Suspense fallback={<MapScreenFallback />}>
        <MapData focusId={focus} />
      </Suspense>

      <BottomNav />
    </PhoneShell>
  )
}
