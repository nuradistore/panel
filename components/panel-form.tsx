"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPayment } from "@/app/actions/create-payment"
import { checkUserExists } from "@/app/actions/check-user-exists"
import { plans, type PlanCategory } from "@/data/plans"
import { formatRupiah } from "@/lib/utils"
import {
  Bot,
  Check,
  ChevronRight,
  Crown,
  Cpu,
  Database,
  HardDrive,
  Loader2,
  Mail,
  PackageOpen,
  Sparkles,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"
import { StatusModal } from "./status-modal"
import { motion } from "framer-motion"

const categoryMeta: Record<PlanCategory, { label: string; description: string; icon: React.ReactNode }> = {
  "panel-bot": {
    label: "Bot Panel",
    description: "Untuk WhatsApp, Telegram, Discord, dan bot lainnya.",
    icon: <Bot className="h-4 w-4" />,
  },
  "admin-panel": {
    label: "Admin Panel",
    description: "Paket khusus akses dan pengelolaan admin panel.",
    icon: <Crown className="h-4 w-4" />,
  },
}

export default function PanelForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("")
  const [activeCategory, setActiveCategory] = useState<PlanCategory>("panel-bot")
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "loading">("info")
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const visiblePlans = useMemo(
    () => plans.filter((plan) => plan?.category === activeCategory),
    [activeCategory],
  )

  const selected = plans.find((plan) => plan?.id === selectedPlan)

  const switchCategory = (category: PlanCategory) => {
    setActiveCategory(category)
    setSelectedPlan("")
    setShowConfirmation(false)
  }

  const validateAndContinue = async () => {
    if (username.length < 3 || /[^a-zA-Z0-9]/.test(username)) {
      toast({
        title: "Username belum valid",
        description: "Minimal 3 karakter dan hanya boleh huruf serta angka.",
        variant: "destructive",
      })
      return
    }

    if (!username || !email || !selectedPlan) {
      toast({
        title: "Data belum lengkap",
        description: "Isi username, email, lalu pilih paket terlebih dahulu.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: "Email tidak valid", description: "Periksa kembali alamat email kamu.", variant: "destructive" })
      return
    }

    setIsValidating(true)
    setModalType("loading")
    setModalTitle("Memeriksa data")
    setModalMessage("Sebentar, kami sedang memeriksa username dan email kamu.")
    setShowModal(true)

    try {
      const result = await checkUserExists(username, email)
      if (!result.success) throw new Error(result.error || "Gagal memeriksa data")

      if (result.usernameExists) {
        setModalType("error")
        setModalTitle("Username sudah digunakan")
        setModalMessage("Gunakan username lain untuk melanjutkan.")
        return
      }

      if (result.emailExists) {
        setModalType("error")
        setModalTitle("Email sudah digunakan")
        setModalMessage("Gunakan email lain untuk melanjutkan.")
        return
      }

      setShowModal(false)
      setShowConfirmation(true)
    } catch (error) {
      setModalType("error")
      setModalTitle("Pemeriksaan gagal")
      setModalMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat memeriksa data.")
      setShowModal(true)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await validateAndContinue()
  }

  const handleConfirm = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gateway pembayaran tidak merespons. Coba lagi beberapa saat.")), 15000),
      )
      const result = await Promise.race([createPayment(selectedPlan, username, email), timeout])

      if (!result.success || !result.transactionId) {
        throw new Error(result.error || "Pembayaran belum dapat dibuat.")
      }

      setShowConfirmation(false)
      router.push(`/invoice/${result.transactionId}`)
    } catch (error) {
      setShowConfirmation(false)
      setModalType("error")
      setModalTitle("Pembayaran belum tersedia")
      setModalMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pembayaran.")
      setShowModal(true)
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[#0A1020]/95 shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur-xl">
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.12),transparent_45%),radial-gradient(circle_at_top_right,rgba(139,92,246,.10),transparent_42%)] p-5 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Katalog Produk</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Pilih jenis panel</h2>
            </div>
            <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200 sm:flex">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="space-y-6 p-4 md:p-7">
          <div className="grid gap-3 md:grid-cols-2">
            <Field icon={<User className="h-4 w-4" />} label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: brock123"
                required
                className="h-12 rounded-xl border-white/10 bg-[#070B15] text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
              />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />} label="Email Aktif">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="h-12 rounded-xl border-white/10 bg-[#070B15] text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
              />
            </Field>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/8 bg-[#070B15] p-1.5">
              {(Object.keys(categoryMeta) as PlanCategory[]).map((category) => {
                const meta = categoryMeta[category]
                const active = activeCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => switchCategory(category)}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition-all ${
                      active
                        ? "bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 text-[#041017] shadow-[0_12px_34px_rgba(34,211,238,.16)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-xs leading-5 text-slate-500">
              <span className="mt-0.5 text-cyan-300">{categoryMeta[activeCategory].icon}</span>
              <span>{categoryMeta[activeCategory].description}</span>
            </div>
          </div>

          {visiblePlans.length > 0 ? (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-2 gap-2.5 lg:gap-3"
            >
              {visiblePlans.map((plan) => {
                const active = selectedPlan === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`group relative min-h-[188px] overflow-hidden rounded-[20px] border p-3 text-left transition-all duration-200 sm:min-h-[200px] sm:p-4 ${
                      active
                        ? "border-cyan-300/60 bg-cyan-300/[0.075] shadow-[0_0_0_1px_rgba(103,232,249,.12),0_18px_44px_rgba(0,0,0,.28)]"
                        : "border-white/8 bg-white/[0.025] hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="line-clamp-2 text-[12px] font-black leading-4 text-white sm:text-sm">{plan.name}</h3>
                          {plan.badge && (
                            <span className="hidden shrink-0 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-200 sm:inline-flex">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-lg font-black tracking-tight text-cyan-200 sm:text-xl">{formatRupiah(plan.price)}</p>
                      </div>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${active ? "border-cyan-200 bg-cyan-200 text-[#041017]" : "border-white/10 text-transparent"}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      <CompactSpec icon={<Database className="h-3 w-3" />} label="RAM" value={plan.memory === 0 ? "∞" : `${plan.memory}`} />
                      <CompactSpec icon={<HardDrive className="h-3 w-3" />} label="Disk" value={plan.disk === 0 ? "∞" : `${plan.disk}`} />
                      <CompactSpec icon={<Cpu className="h-3 w-3" />} label="CPU" value={plan.cpu === 0 ? "∞" : `${plan.cpu}%`} />
                    </div>

                    <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px]">{plan.description}</p>
                  </button>
                )
              })}
            </motion.div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-cyan-300/15 bg-cyan-300/[0.025] px-5 py-10 text-center">
              <PackageOpen className="mx-auto h-7 w-7 text-cyan-300/70" />
              <h3 className="mt-3 text-sm font-bold text-white">Belum ada produk di kategori ini</h3>
              <p className="mt-1 text-xs text-slate-500">Tambahkan produk di data/plans.ts. Halaman tetap aman dan tidak akan blank.</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isValidating || !selectedPlan}
            className="hidden h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 font-black text-[#041017] shadow-[0_14px_45px_rgba(34,211,238,.14)] hover:brightness-110 disabled:opacity-40 sm:flex"
          >
            {isValidating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memeriksa data...</> : <>Lanjutkan Pembayaran <ChevronRight className="ml-2 h-5 w-5" /></>}
          </Button>
        </div>
      </form>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/15 bg-[#070B15]/95 p-3 shadow-[0_-18px_60px_rgba(0,0,0,.45)] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-white">{selected.name}</p>
              <p className="text-base font-black text-cyan-200">{formatRupiah(selected.price)}</p>
            </div>
            <Button
              type="button"
              onClick={validateAndContinue}
              disabled={isValidating}
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-4 font-black text-[#041017]"
            >
              {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Lanjut <ChevronRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={showModal}
        onClose={() => !isLoading && setShowModal(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
      />

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        planId={selectedPlan}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  )
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
        <span className="text-cyan-300">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  )
}

function CompactSpec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/6 bg-black/20 px-2 py-2">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="hidden text-[8px] sm:inline">{label}</span></div>
      <div className="mt-1 truncate text-[9px] font-bold text-slate-300 sm:text-[10px]">{value}</div>
    </div>
  )
}
