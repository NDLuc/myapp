import type { ReactNode } from "react"

export function StatusBar() {
  return (
    <div className="flex items-center px-6 pt-3 pb-1 text-sm font-semibold text-foreground">
      <span>9:41</span>
    </div>
  )
}

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-muted/40 sm:items-center sm:py-8">
      <div className="relative flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-background sm:h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-foreground/90 sm:shadow-2xl">
        {children}
      </div>
    </div>
  )
}
