import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Share2,
  Clock,
  MapPin,
  Gauge,
  Activity,
  Info,
  Map,
  Trash2,
} from "lucide-react"
import { PhoneShell } from "@/components/phone-shell"
import { EventMiniMap } from "@/components/event-mini-map"
import { LEVEL_LABEL, getEvent } from "@/lib/events"
import { DeleteEventButton } from "@/components/delete-event-button"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  return (
    <PhoneShell>
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <Link href="/events" aria-label="Quay lại" className="p-1 text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Chi tiết sự kiện</h1>
        <button type="button" aria-label="Chia sẻ" className="p-1 text-foreground">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* info card */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span
                className={`h-3 w-3 rounded-full ${event.level === "high" ? "bg-destructive" : "bg-green-500"
                  }`}
              />
              {LEVEL_LABEL[event.level]}
            </span>
          </div>

          <dl className="flex flex-col gap-3.5 pt-3.5">
            <InfoRow icon={Clock} label="Thời gian">
              {event.time} - {event.date}
            </InfoRow>
            <InfoRow icon={MapPin} label="Địa chỉ">
              <span className="font-semibold text-foreground">{event.street}</span>
              <span className="block text-sm text-muted-foreground">
                {event.district}
              </span>
            </InfoRow>
            <InfoRow icon={Gauge} label="Tốc độ xe">
              {event.speed} km/h
            </InfoRow>
            <InfoRow icon={Activity} label="Mức rung">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${event.level === "high" ? "bg-destructive" : "bg-green-500"
                    }`}
                />
                {event.level === "high" ? "Cao" : "Bình thường"} ({event.vibration} g)
              </span>
            </InfoRow>
          </dl>
        </div>

        {/* mini map */}
        <div className="relative mt-4 h-40 overflow-hidden rounded-2xl border border-border">
          <EventMiniMap event={event} />
        </div>

        {/* note */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Sự kiện được phát hiện bởi thiết bị trên xe và đã gửi lên server lúc{" "}
            {event.time} - {event.date}.
          </p>
        </div>

        {/* actions */}
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href={`/?focus=${event.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Map className="h-5 w-5" />
            Xem trên bản đồ
          </Link>
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>
    </PhoneShell>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex-1 text-right text-sm font-medium text-foreground">
        {children}
      </div>
    </div>
  )
}
