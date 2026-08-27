"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah, formatDate } from "@/lib/utils"
import { plans } from "@/data/plans"
import { motion } from "framer-motion"
import { Clock, CheckCircle, AlertTriangle, Loader2, User, Mail, Package, Calendar, CreditCard } from "lucide-react"

interface InvoiceDetailsProps {
  transactionId: string
  planId: string
  username: string
  email: string
  amount: number
  fee: number
  total: number
  createdAt: string
  status: "pending" | "paid" | "completed" | "failed"
}

export function InvoiceDetails({
  transactionId,
  planId,
  username,
  email,
  amount,
  fee,
  total,
  createdAt,
  status,
}: InvoiceDetailsProps) {
  const plan = plans.find((p) => p?.id === planId)

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <div className="status-badge status-pending">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Pembayaran
          </div>
        )
      case "paid":
        return (
          <div className="status-badge status-paid">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Sedang Diproses
          </div>
        )
      case "completed":
        return (
          <div className="status-badge status-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sukses
          </div>
        )
      case "failed":
        return (
          <div className="status-badge status-failed">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Gagal
          </div>
        )
      default:
        return (
          <div className="status-badge status-pending">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Pembayaran
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-cyan-300/10 bg-[#0A1020] overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-400/20 via-sky-400/10 to-violet-400/15 text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Detail Invoice</h3>
            {getStatusBadge()}
          </div>
        </div>

        <CardContent className="p-0">
          {/* Header Section */}
          <div className="p-5 border-b border-white/8 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#070B15] rounded-full">
                <CreditCard className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">ID Transaksi</p>
                <p className="font-mono text-sm bg-[#070B15] px-2 py-1 rounded border border-white/8 text-gray-300">
                  {transactionId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#070B15] rounded-full">
                <Calendar className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tanggal</p>
                <p className="text-sm text-white">{formatDate(createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Customer Info Section */}
          <div className="p-5 border-b border-white/8">
            <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Informasi Pelanggan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#070B15] rounded-full mt-1">
                  <User className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Nama Pengguna</p>
                  <p className="font-medium text-white">{username}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#070B15] rounded-full mt-1">
                  <Mail className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium text-white">{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details Section */}
          <div className="p-5 border-b border-white/8">
            <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Detail Paket</h4>
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-[#070B15] rounded-full mt-1">
                <Package className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Paket</p>
                <p className="font-medium text-white text-lg">{plan?.name || "Paket"}</p>
              </div>
            </div>

            <div className="bg-[#070B15] p-4 rounded-2xl border border-white/8">
              {plan ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">RAM</p>
                    <p className="font-medium text-white">{plan.memory} MB</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Disk</p>
                    <p className="font-medium text-white">{plan.disk} MB</p>
                  </div>
                  <div>
                    <p className="text-gray-400">CPU</p>
                    <p className="font-medium text-white">{plan.cpu}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Detail paket tidak tersedia</p>
              )}
            </div>
          </div>

          {/* Payment Summary Section */}
          <div className="p-5">
            <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Ringkasan Pembayaran</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">{formatRupiah(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Biaya Admin:</span>
                <span className="text-white">{formatRupiah(fee)}</span>
              </div>
              <div className="h-px bg-white/8 my-3"></div>
              <div className="flex justify-between font-medium">
                <span className="text-white">Total:</span>
                <span className="text-xl text-cyan-200">{formatRupiah(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
