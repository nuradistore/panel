"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPayment } from "@/app/actions/create-payment"
import { checkUserExists } from "@/app/actions/check-user-exists"
import { plans, type PlanCategory } from "@/data/plans"
import { formatRupiah } from "@/lib/utils"
import { Bot, Check, ChevronRight, Cpu, Crown, HardDrive, Loader2, Mail, MemoryStick, ShieldCheck, Sparkles, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"
import { StatusModal } from "./status-modal"
import { AnimatePresence, motion } from "framer-motion"

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

  const visiblePlans = useMemo(() => plans.filter((plan) => plan?.category === activeCategory), [activeCategory])
  const currentPlan = plans.find((plan) => plan?.id === selectedPlan)

  const changeCategory = (category: PlanCategory) => {
    setActiveCategory(category)
    setSelectedPlan("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (username.length < 3 || /[^a-zA-Z0-9]/.test(username)) {
      toast({ title: "Error", description: "Username minimal 3 karakter dan hanya boleh huruf & angka", variant: "destructive" })
      return
    }
    if (!username || !email || !selectedPlan) {
      toast({ title: "Error", description: "Lengkapi data dan pilih paket terlebih dahulu", variant: "destructive" })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: "Error", description: "Format email tidak valid", variant: "destructive" })
      return
    }

    setIsValidating(true)
    try {
      setModalType("loading")
      setModalTitle("Memeriksa Ketersediaan")
      setModalMessage("Sedang memeriksa username dan email di panel...")
      setShowModal(true)
      const result = await checkUserExists(username, email)
      if (!result.success) throw new Error(result.error || "Gagal memeriksa data")
      if (result.usernameExists) {
        setModalType("error"); setModalTitle("Username Sudah Terdaftar"); setModalMessage("Gunakan username lain yang belum terdaftar."); return
      }
      if (result.emailExists) {
        setModalType("error"); setModalTitle("Email Sudah Terdaftar"); setModalMessage("Gunakan email lain yang belum terdaftar."); return
      }
      setShowModal(false)
      setShowConfirmation(true)
    } catch (error) {
      setModalType("error")
      setModalTitle("Terjadi Kesalahan")
      setModalMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat memeriksa data")
    } finally {
      setIsValidating(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const result = await createPayment(selectedPlan, username, email)
      if (!result.success) throw new Error(result.error)
      router.push(`/invoice/${result.transactionId}`)
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Terjadi kesalahan", variant: "destructive" })
      setShowConfirmation(false)
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" /> Instant Panel Store
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">Pilih panel yang pas buat kebutuhanmu.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Pilih kategori, tentukan paket, lalu checkout. Proses tetap cepat dan otomatis seperti sebelumnya.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-slate-200">Username Panel</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="contoh: brock123" required className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-11 text-white placeholder:text-slate-600 focus:border-cyan-400/60" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-200">Email Aktif</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-11 text-white placeholder:text-slate-600 focus:border-cyan-400/60" />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Katalog Produk</p>
              <h2 className="mt-1 text-xl font-bold text-white">Pilih jenis panel</h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">{visiblePlans.length} paket tersedia</span>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5">
            <button type="button" onClick={() => changeCategory("panel-bot")} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${activeCategory === "panel-bot" ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/15" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <Bot className="h-4 w-4" /> Panel Bot
            </button>
            <button type="button" onClick={() => changeCategory("admin-panel")} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${activeCategory === "admin-panel" ? "bg-gradient-to-r from-violet-400 to-fuchsia-500 text-white shadow-lg shadow-violet-500/15" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <Crown className="h-4 w-4" /> Admin Panel
            </button>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-slate-400">
            {activeCategory === "panel-bot" ? <Bot className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> : <Crown className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />}
            {activeCategory === "panel-bot" ? "Panel Bot untuk menjalankan script WhatsApp, Telegram, Discord, dan kebutuhan bot lainnya." : "Admin Panel untuk paket yang membutuhkan akses pengelolaan panel lebih tinggi."}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-3 sm:grid-cols-2">
            {visiblePlans.map((plan) => {
              const selected = selectedPlan === plan.id
              const unlimited = plan.memory === 0 && plan.disk === 0
              return (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)} className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${selected ? activeCategory === "panel-bot" ? "border-cyan-400/70 bg-cyan-400/[0.08] shadow-[0_0_35px_rgba(34,211,238,0.10)]" : "border-violet-400/70 bg-violet-400/[0.08] shadow-[0_0_35px_rgba(167,139,250,0.10)]" : "border-white/[0.08] bg-white/[0.025] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045]"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                        {plan.popular && <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${activeCategory === "panel-bot" ? "bg-cyan-400/15 text-cyan-300" : "bg-violet-400/15 text-violet-300"}`}>Popular</span>}
                      </div>
                      <p className={`mt-2 text-xl font-black ${activeCategory === "panel-bot" ? "text-cyan-300" : "text-violet-300"}`}>{formatRupiah(plan.price)}</p>
                    </div>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${selected ? activeCategory === "panel-bot" ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-violet-300 bg-violet-300 text-slate-950" : "border-white/10 text-transparent"}`}><Check className="h-4 w-4" /></div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                    <div className="rounded-lg bg-black/20 p-2"><MemoryStick className="mb-1 h-3.5 w-3.5" /><span className="block font-semibold text-slate-200">{unlimited ? "Unlimited" : `${plan.memory} MB`}</span>RAM</div>
                    <div className="rounded-lg bg-black/20 p-2"><HardDrive className="mb-1 h-3.5 w-3.5" /><span className="block font-semibold text-slate-200">{unlimited ? "Unlimited" : `${plan.disk} MB`}</span>Disk</div>
                    <div className="rounded-lg bg-black/20 p-2"><Cpu className="mb-1 h-3.5 w-3.5" /><span className="block font-semibold text-slate-200">{plan.cpu === 0 ? "Unlimited" : `${plan.cpu}%`}</span>CPU</div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{plan.description}</p>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {currentPlan && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Yang kamu dapat</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {currentPlan.features.map((feature) => <div key={feature} className="flex items-center gap-2 text-xs text-slate-300"><Check className="h-3.5 w-3.5 text-emerald-400" />{feature}</div>)}
            </div>
          </motion.div>
        )}

        <Button type="submit" disabled={isValidating || !selectedPlan} className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-base font-black text-white shadow-xl shadow-blue-500/10 transition hover:brightness-110 disabled:opacity-40">
          {isValidating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memeriksa...</> : <>Lanjutkan Pembelian <ChevronRight className="ml-2 h-5 w-5" /></>}
        </Button>
      </form>

      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} type={modalType} title={modalTitle} message={modalMessage} />
      <ConfirmationDialog open={showConfirmation} onOpenChange={setShowConfirmation} planId={selectedPlan} onConfirm={handleConfirm} isLoading={isLoading} />
    </>
  )
}
