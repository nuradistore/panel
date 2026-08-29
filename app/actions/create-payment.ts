"use server"

import { calculateFee, generateTransactionId } from "@/lib/utils"
import { plans } from "@/data/plans"
import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { PaymentData } from "@/lib/payments"
import crypto from "crypto"

const SAKURU_API_ID = appConfig.pay.api_id
const SAKURU_API_KEY = appConfig.pay.api_key
const SAKURU_API_URL = "https://sakurupiah.id/api/create.php"
const APP_URL = (process.env.APP_URL || "https://www.tokopanelbrockstore.my.id").replace(/\/$/, "")

export async function createPayment(planId: string, username: string, email: string) {
  try {
    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!/^[a-zA-Z0-9]{3,32}$/.test(cleanUsername)) {
      throw new Error("Username minimal 3 karakter dan hanya boleh huruf/angka")
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error("Email tidak valid")
    }
    if (!SAKURU_API_ID || !SAKURU_API_KEY) {
      throw new Error("Konfigurasi Sakurupiah belum lengkap")
    }

    const plan = plans.find((p) => p?.id === planId)
    if (!plan) throw new Error("Plan tidak ditemukan")

    const internalFee = calculateFee(plan.price)
    const nominal = plan.price + internalFee
    const transactionId = generateTransactionId()
    const method = "QRIS2"

    const signature = crypto
      .createHmac("sha256", SAKURU_API_KEY)
      .update(SAKURU_API_ID + method + transactionId + nominal)
      .digest("hex")

    const bodyData = new URLSearchParams()
    bodyData.append("api_id", SAKURU_API_ID)
    bodyData.append("method", method)
    bodyData.append("name", cleanUsername)
    bodyData.append("email", cleanEmail)
    bodyData.append("phone", "6280000000000")
    bodyData.append("amount", nominal.toString())
    bodyData.append("merchant_fee", "1")
    bodyData.append("merchant_ref", transactionId)
    bodyData.append("expired", "24")
    bodyData.append("produk[]", plan.name)
    bodyData.append("qty[]", "1")
    bodyData.append("harga[]", plan.price.toString())
    bodyData.append("callback_url", `${APP_URL}/callback`)
    bodyData.append("return_url", `${APP_URL}/invoice/${transactionId}`)
    bodyData.append("signature", signature)

    const response = await fetch(SAKURU_API_URL, {
      method: "POST",
      body: bodyData,
      headers: {
        Authorization: `Bearer ${SAKURU_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
    })

    const raw = await response.text()
    let json: any
    try {
      json = JSON.parse(raw)
    } catch {
      console.error("Sakurupiah returned NON-JSON:", raw)
      throw new Error("API Sakurupiah tidak mengembalikan JSON")
    }

    if (String(json.status) !== "200") {
      throw new Error(json.message || "Gagal membuat invoice Sakurupiah")
    }

    const pay = json.data?.[0]
    if (!pay?.trx_id || !pay?.qr || !pay?.expired) {
      throw new Error("Data pembayaran Sakurupiah tidak lengkap")
    }

    const initialGatewayStatus = String(pay.payment_status || "pending").toLowerCase()
    const initialStatus: PaymentData["status"] = ["gagal", "failed", "expired"].includes(initialGatewayStatus)
      ? "failed"
      : "pending"

    const paymentData: PaymentData = {
      transactionId,
      vpediaId: String(pay.trx_id),
      planId,
      username: cleanUsername,
      email: cleanEmail,
      amount: plan.price,
      fee: internalFee,
      total: nominal,
      qrImageUrl: String(pay.qr),
      expirationTime: new Date(pay.expired).toISOString(),
      status: initialStatus,
      createdAt: new Date().toISOString(),
    }

    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    await db.collection<PaymentData>("payments").insertOne(paymentData)

    revalidatePath(`/invoice/${transactionId}`)
    return { success: true, transactionId }
  } catch (error) {
    console.error("Error createPayment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan",
    }
  }
}
