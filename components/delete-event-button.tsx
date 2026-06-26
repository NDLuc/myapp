"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface DeleteEventButtonProps {
  eventId: string
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/events/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: eventId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        alert(`Lỗi: ${data.error || "Không thể xóa sự kiện"}`)
        setIsLoading(false)
        return
      }

      // Successfully deleted, redirect to events list
      router.push("/events")
      router.refresh()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error("[v0] Delete error:", errorMsg)
      alert(`Lỗi: ${errorMsg}`)
      setIsLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground text-center">
          Bạn có chắc muốn xóa sự kiện này?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-muted py-3.5 text-sm font-semibold text-muted-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive py-3.5 text-sm font-semibold text-destructive-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            {isLoading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 rounded-xl bg-destructive py-3.5 text-sm font-semibold text-destructive-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <Trash2 className="h-5 w-5" />
      Xóa sự kiện
    </button>
  )
}
