import { Menu, BarChart3 } from "lucide-react"
import { PhoneShell, StatusBar } from "@/components/phone-shell"
import { BottomNav } from "@/components/bottom-nav"

export default function ReportsPage() {
  return (
    <PhoneShell>
      <StatusBar />
      <header className="flex items-center justify-between px-4 py-3">
        <button type="button" aria-label="Menu" className="p-1 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Báo cáo</h1>
        <span className="w-8" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Báo cáo thống kê sự kiện bất thường sẽ hiển thị tại đây.
        </p>
      </div>
      <BottomNav />
    </PhoneShell>
  )
}
