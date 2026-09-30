"use client"

// Client singleton untuk heartbeat visitor.
// - Heartbeat dikirim tiap HEARTBEAT_MS selama tab terlihat.
// - Tab disembunyikan / ditutup -> kirim "leave" agar hitungan langsung turun.
// - Jika "leave" gagal terkirim (HP mati, koneksi putus), server tetap menganggap
//   visitor offline setelah batas waktu last-seen.

const HEARTBEAT_MS = 10_000
const STORAGE_KEY = "brock_visitor_id"
const ENDPOINT = "/api/visitors"

type Listener = (count: number) => void

const listeners = new Set<Listener>()
let started = false
let timer: ReturnType<typeof setInterval> | null = null
let visitorId: string | null = null
let lastCount: number | null = null

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

function getVisitorId() {
  if (visitorId) return visitorId

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && /^[A-Za-z0-9_-]{16,64}$/.test(saved)) return (visitorId = saved)
    const fresh = createId()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return (visitorId = fresh)
  } catch {
    // Storage diblokir (mode privat ketat) -> id per sesi halaman.
    return (visitorId = createId())
  }
}

function publish(count: number) {
  lastCount = count
  listeners.forEach((listener) => listener(count))
}

async function beat() {
  if (document.visibilityState !== "visible") return

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: getVisitorId() }),
      keepalive: true,
    })
    if (!response.ok) return
    const data = await response.json()
    if (typeof data.count === "number") publish(data.count)
  } catch {
    // Abaikan; heartbeat berikutnya akan mencoba lagi.
  }
}

function leave() {
  const payload = JSON.stringify({ visitorId: getVisitorId(), action: "leave" })

  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([payload], { type: "application/json" }))) return
  } catch {}

  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

function resume() {
  if (timer) return
  void beat()
  timer = setInterval(() => void beat(), HEARTBEAT_MS)
}

function pause() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export function startVisitorPresence() {
  if (started || typeof window === "undefined") return
  started = true

  if (document.visibilityState === "visible") resume()

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      resume()
    } else {
      pause()
      leave()
    }
  })

  window.addEventListener("pagehide", () => {
    pause()
    leave()
  })

  // Halaman dipulihkan dari back/forward cache.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && document.visibilityState === "visible") resume()
  })
}

export function subscribeVisitorCount(listener: Listener) {
  listeners.add(listener)
  if (lastCount !== null) listener(lastCount)
  return () => {
    listeners.delete(listener)
  }
}
