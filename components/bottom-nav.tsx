"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, ListChecks, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Bản đồ", icon: MapPin, match: (p: string) => p === "/" },
  {
    href: "/events",
    label: "Lịch sử",
    icon: ListChecks,
    match: (p: string) => p.startsWith("/events"),
  },
  {
    href: "/reports",
    label: "Báo cáo",
    icon: BarChart3,
    match: (p: string) => p.startsWith("/reports"),
  },
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="border-t border-border bg-card">
      <ul className="flex items-stretch justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                <span>{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
