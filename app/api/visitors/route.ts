import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"

export const dynamic = "force-dynamic"

// Visitor dianggap offline jika tidak mengirim heartbeat selama batas ini.
// Client mengirim heartbeat tiap 10 detik, jadi 30 detik = toleransi 2 heartbeat terlewat.
export const VISITOR_ACTIVE_WINDOW_MS = 30_000

const VISITOR_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/
const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" }

async function getCollection() {
  const client = await clientPromise
  return client.db(appConfig.mongodb.dbName).collection("visitor_presence")
}

async function countActive() {
  const collection = await getCollection()
  return collection.countDocuments({
    lastSeenAt: { $gte: new Date(Date.now() - VISITOR_ACTIVE_WINDOW_MS) },
  })
}

// GET: hanya membaca jumlah visitor aktif.
export async function GET() {
  try {
    return NextResponse.json({ count: await countActive() }, { headers: NO_STORE })
  } catch (error) {
    console.error("Visitor count error:", error)
    return NextResponse.json({ count: 0, error: true }, { status: 500, headers: NO_STORE })
  }
}

// POST: heartbeat ({ visitorId }) atau keluar ({ visitorId, action: "leave" }).
// Response selalu berisi jumlah visitor aktif terbaru.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : ""

    if (!VISITOR_ID_PATTERN.test(visitorId)) {
      return NextResponse.json({ error: "visitorId tidak valid" }, { status: 400, headers: NO_STORE })
    }

    const collection = await getCollection()

    if (body?.action === "leave") {
      await collection.deleteOne({ visitorId })
    } else {
      await collection.updateOne(
        { visitorId },
        { $set: { lastSeenAt: new Date() }, $setOnInsert: { firstSeenAt: new Date() } },
        { upsert: true },
      )
    }

    return NextResponse.json({ count: await countActive() }, { headers: NO_STORE })
  } catch (error) {
    console.error("Visitor heartbeat error:", error)
    return NextResponse.json({ error: "Gagal memperbarui visitor." }, { status: 500, headers: NO_STORE })
  }
}
