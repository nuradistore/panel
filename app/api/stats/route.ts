import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { Pterodactyl } from "@/lib/pterodactyl"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // ==============================
    // AMBIL DATA DARI PTERODACTYL
    // ==============================
    const pterodactyl = new Pterodactyl()

    const [users, servers] = await Promise.all([
      pterodactyl.listUsers(),
      pterodactyl.listServers(),
    ])

    const totalUsers = users.length
    const totalServers = servers.length

    // ==============================
    // AMBIL DATA TRANSAKSI DARI MONGODB
    // ==============================
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)

    const payments = db.collection("payments")

    const totalPurchases = await payments.countDocuments({
      status: "completed",
    })

    // ==============================
    // KIRIM DATA KE WEBSITE
    // ==============================
    return NextResponse.json(
      {
        totalUsers,
        totalServers,
        totalPurchases,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching stats:", error)

    return NextResponse.json(
      {
        totalUsers: 0,
        totalServers: 0,
        totalPurchases: 0,
        error: "Failed to fetch stats",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  }
}
