import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { plans } from "@/data/plans"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const payments = db.collection("payments")
    const totalPurchases = await payments.countDocuments({ status: "completed" })
    const uniqueUsers = await payments.distinct("username", { status: "completed" })
    const panelBotPlanIds = plans.filter((p) => p.category === "panel-bot").map((p) => p.id)
    const totalServers = await payments.countDocuments({
      status: "completed",
      planId: { $in: panelBotPlanIds },
      "panelDetails.serverId": { $ne: null },
    })
    return NextResponse.json({ totalUsers: uniqueUsers.length, totalServers, totalPurchases })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
