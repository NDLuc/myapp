"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, ListChecks, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type MainTab = "map" | "events"

const tabs = [
  {
    key: "map",
    href: "/",
    label: "Bản đồ",
    icon: MapPin,
    match: (p: string) => p === "/",
  },
  {
    key: "events",
    href: "/events",
    label: "Lịch sử",
    icon: ListChecks,
    match: (p: string) => p.startsWith("/events"),
  },
  {
    key: "reports",
    href: "/reports",
    label: "Báo cáo",
    icon: BarChart3,
    match: (p: string) => p.startsWith("/reports"),
  },
  {
    key: "settings",
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
]

export function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab?: MainTab
  onTabChange?: (tab: MainTab) => void
}) {
  const pathname = usePathname()

  return (
    <nav className="border-t border-border bg-card">
      <ul className="flex items-stretch justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isInternalTab = tab.key === "map" || tab.key === "events"
          const active = activeTab ? tab.key === activeTab : tab.match(pathname)
          const Icon = tab.icon

          const className = cn(
            "flex w-full flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
            active ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )

          return (
            <li key={tab.href} className="flex-1">
              {onTabChange && isInternalTab ? (
                <button
                  type="button"
                  onClick={() => onTabChange(tab.key as MainTab)}
                  className={className}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  <span>{tab.label}</span>
                </button>
              ) : (
                <Link href={tab.href} className={className}>
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  <span>{tab.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}