"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import { startVisitorPresence, subscribeVisitorCount } from "@/lib/visitor-presence"

export function VisitorCountCard() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeVisitorCount(setCount)
    startVisitorPresence()
    return unsubscribe
  }, [])

  return (
    <div
      className="relative rounded-2xl border border-white/10 bg-white/[.02] p-5 text-center"
      aria-live="polite"
    >
      <span className="absolute right-4 top-4 flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>

      <Users className="mx-auto h-5 w-5 text-cyan-300" />

      <div className="mt-3 text-2xl font-black text-cyan-300">
        {count === null ? "-" : count} Orang
      </div>

      <div className="mt-1 text-xs text-slate-500">Sedang Berkunjung</div>
    </div>
  )
}
