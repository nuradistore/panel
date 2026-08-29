"use server"

import {
  getPayment,
  updatePaymentStatus,
  claimPaymentForProcessing,
  releasePaymentProcessing,
  completePaymentProcessing,
} from "@/lib/payments"
import { plans } from "@/data/plans"
import { createPanel } from "./create-panel"
import { appConfig } from "@/data/config"

const API_ID = appConfig.pay.api_id
const API_KEY = appConfig.pay.api_key
const API_STATUS_URL = "https://sakurupiah.id/api/status-transaction.php"

export async function checkPaymentStatus(transactionId: string) {
  try {
    const payment = await getPayment(transactionId)
    if (!payment) return { success: false, error: "Pembayaran tidak ditemukan" }

    if (payment.status === "completed") {
      return { success: true, status: "completed" as const, panelDetails: payment.panelDetails }
    }
    if (payment.status === "processing") {
      return { success: true, status: "processing" as const }
    }
    if (!API_ID || !API_KEY) {
      return { success: false, error: "Konfigurasi pembayaran belum lengkap" }
    }

    const form = new FormData()
    form.append("api_id", API_ID)
    form.append("method", "status")
    form.append("trx_id", payment.vpediaId)

    const response = await fetch(API_STATUS_URL, {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    })

    const raw = await response.text()
    let data: any
    try {
      data = JSON.parse(raw)
    } catch {
      console.error("Sakurupiah tidak mengembalikan JSON:", raw)
      return { success: false, error: "Response Sakurupiah tidak valid" }
    }

    if (String(data.status) !== "200") {
      return { success: false, error: data.message || "Gagal cek status pembayaran" }
    }

    const gatewayData = data.data?.[0] ?? {}
    const gatewayStatus = String(gatewayData.status ?? gatewayData.payment_status ?? "").toLowerCase()

    if (gatewayStatus === "pending") {
      return { success: true, status: "pending" as const }
    }

    if (["gagal", "failed", "expired"].includes(gatewayStatus)) {
      await updatePaymentStatus(transactionId, "failed")
      return { success: true, status: "failed" as const }
    }

    if (!["berhasil", "success", "paid"].includes(gatewayStatus)) {
      console.log("Unknown Sakurupiah status:", gatewayStatus)
      return { success: true, status: "pending" as const }
    }

    const plan = plans.find((p) => p?.id === payment.planId)
    if (!plan) return { success: false, error: "Plan tidak ditemukan" }

    // Atomic transition from pending/paid -> processing. Only one caller wins.
    const claimed = await claimPaymentForProcessing(transactionId)
    if (!claimed) {
      const latest = await getPayment(transactionId)
      if (latest?.status === "completed") {
        return { success: true, status: "completed" as const, panelDetails: latest.panelDetails }
      }
      if (latest?.status === "processing") {
        return { success: true, status: "processing" as const }
      }
      return { success: false, error: "Transaksi belum dapat diproses. Silakan cek kembali." }
    }

    let panelCreated = false
    try {
      const panelResult = await createPanel({
        username: payment.username,
        email: payment.email,
        memory: plan.memory,
        disk: plan.disk,
        cpu: plan.cpu,
        planId: payment.planId,
        createdAt: payment.createdAt,
      })
      panelCreated = true

      const panelDetails = {
        username: payment.username,
        password: panelResult.password,
        serverId: panelResult.serverId ?? null,
        type: (panelResult.type || plan.category) as "panel-bot" | "admin-panel",
        userId: panelResult.userId,
      }

      const saved = await completePaymentProcessing(transactionId, panelDetails)
      if (!saved) {
        // Resource already exists externally; do not auto-retry and create duplicates.
        return {
          success: false,
          status: "processing" as const,
          error: "Panel berhasil dibuat tetapi transaksi belum dapat difinalisasi. Hubungi admin dan jangan ulangi pembayaran.",
        }
      }

      return {
        success: true,
        status: "completed" as const,
        panelDetails,
        showWhatsappPopup: true,
      }
    } catch (error) {
      console.error("Gagal membuat panel:", error)
      if (!panelCreated) await releasePaymentProcessing(transactionId)
      return {
        success: false,
        status: panelCreated ? ("processing" as const) : ("paid" as const),
        error: error instanceof Error ? error.message : "Pembayaran berhasil tetapi panel gagal dibuat",
      }
    }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kesalahan memeriksa status pembayaran",
    }
  }
}
