import { Menu, Settings } from "lucide-react"
import { PhoneShell } from "@/components/phone-shell"
import { BottomNav } from "@/components/bottom-nav"

export default function SettingsPage() {
  return (
    <PhoneShell>
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <button type="button" aria-label="Menu" className="p-1 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Cài đặt</h1>
        <span className="w-8" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Settings className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Tùy chỉnh ngưỡng cảnh báo, đồng bộ và thông báo tại đây.
        </p>
      </div>
      <BottomNav />
    </PhoneShell>
  )
}
