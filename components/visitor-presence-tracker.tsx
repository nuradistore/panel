"use client"

import { useEffect } from "react"
import { startVisitorPresence } from "@/lib/visitor-presence"

// Dipasang di layout supaya setiap halaman yang dibuka dihitung sebagai visitor aktif.
export function VisitorPresenceTracker() {
  useEffect(() => {
    startVisitorPresence()
  }, [])

  return null
}
